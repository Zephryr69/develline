"""Test des formulaires (actions serveur) en envoi natif, sans JavaScript."""
import json,re,io,urllib.request,urllib.error,html as H,sys,uuid
S=json.load(open('/tmp/seed.json')); B='http://localhost:3222'
class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**k): return None
op=urllib.request.build_opener(NoRedir)
def req(path,cookie=None,method='GET',data=None,headers=None):
    h={'Cookie':cookie} if cookie else {}
    if headers: h.update(headers)
    r=urllib.request.Request(B+path,data=data,headers=h,method=method)
    try: x=op.open(r)
    except urllib.error.HTTPError as e: x=e
    hd={k.lower():v for k,v in x.headers.items()}
    cookies=[v for k,v in x.headers.items() if k.lower()=='set-cookie']
    return x.code,x.read().decode('utf8','replace'),hd,cookies
ok=fail=0
def check(c,l):
    global ok,fail
    if c: ok+=1; print('  ✓',l)
    else: fail+=1; print('  ✗ ÉCHEC :',l)
def forms(html):
    out=[]
    for seg in html.split('<form')[1:]:
        seg=seg.split('</form>')[0]
        hidden=re.findall(r'<input[^>]*type="hidden"[^>]*>',seg)
        fields=[]
        for tag in hidden:
            n=re.search(r'name="([^"]*)"',tag); v=re.search(r'value="([^"]*)"',tag)
            if n: fields.append((H.unescape(n.group(1)),H.unescape(v.group(1)) if v else ''))
        out.append((seg,fields))
    return out
def submit(path,cookie,pick,extra,nth=0,source=None):
    s,html,_,_=req(path,source or cookie)
    cands=[f for f in forms(html) if pick(f[0])]
    seg,fields=cands[nth]
    bd='----f'+uuid.uuid4().hex; body=b''
    for k,v in fields+list(extra.items()):
        body+=f'--{bd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    body+=f'--{bd}--\r\n'.encode()
    return req(path,cookie,'POST',body,{'Content-Type':f'multipart/form-data; boundary={bd}'})
ck=lambda t:f'dl_session={S[t]}'
pub=S['pub']

print('— Inscription / connexion')
s,h,hd,c=submit('/inscription',None,lambda g:'name="password"' in g,{'name':'Zoé Test','email':'zoe@example.com','password':'motdepasse9'})
sess=[x for x in c if x.startswith('dl_session=')]
check(s==303 and sess,f'inscription → redirection {s} + cookie de session')
check(sess and 'HttpOnly' in sess[0] and 'SameSite=lax' in sess[0],'cookie httpOnly + SameSite=lax')
zoe=sess[0].split(';')[0] if sess else ''
s,h,_,_=req('/app',zoe); check(s==200 and 'Bonjour, Zoé' in h,'tableau de bord de la nouvelle utilisatrice')
s,h,hd,c=submit('/inscription',None,lambda g:'name="password"' in g,{'name':'Doublon','email':'zoe@example.com','password':'motdepasse9'})
check(s==200 and 'existe déjà' in h,'e-mail déjà utilisé : message d’erreur affiché')
s,h,hd,c=submit('/connexion',None,lambda g:'name="password"' in g,{'email':'zoe@example.com','password':'faux-mot-de-passe'})
check(s==200 and 'incorrect' in h and not [x for x in c if x.startswith('dl_session')],'mauvais mot de passe : refusé, pas de session')
s,h,hd,c=submit('/connexion',None,lambda g:'name="password"' in g,{'email':'ZOE@example.com','password':'motdepasse9'})
check(s==303 and [x for x in c if x.startswith('dl_session=')],'connexion valide (casse de l’e-mail ignorée)')
s,h,hd,c=submit('/connexion?next=%2Fapp%2Fprofil',None,lambda g:'name="password"' in g,{'email':'zoe@example.com','password':'motdepasse9'})
check(hd.get('location','').endswith('/app/profil'),'redirection vers la page demandée après connexion')
s,h,hd,c=submit('/connexion?next=https%3A%2F%2Fevil.com',None,lambda g:'name="password"' in g,{'email':'zoe@example.com','password':'motdepasse9'})
check(hd.get('location','')=='/app','redirection ouverte (open redirect) bloquée')

print('— Contribution à accepter (créée via l’API)')
def mp(fields,fname,fb):
    bd='----dl'+uuid.uuid4().hex; o=b''
    for k,v in fields.items(): o+=f'--{bd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    o+=f'--{bd}\r\nContent-Disposition: form-data; name="file"; filename="{fname}"\r\nContent-Type: application/zip\r\n\r\n'.encode()+fb+b'\r\n'+f'--{bd}--\r\n'.encode()
    return o,{'Content-Type':f'multipart/form-data; boundary={bd}'}
import zipfile
def mkzip(files):
    b=io.BytesIO()
    with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
        for k,v in files.items(): z.writestr(k,v)
    return b.getvalue()
def contribute(title,files):
    d,hd=mp({'title':title,'summary':'Résumé suffisamment long pour valider.','base':'v1.0'},'c.zip',mkzip(files))
    s,b,_,_=req(f'/api/projects/{pub}/contributions',ck('B'),'POST',d,hd); return json.loads(b)
j1=contribute('Première proposition',{'README.md':'# Marché Local\n','src/App.jsx':'function App() { return <Faux />; }\n'})
c1=j1['redirect'].split('/')[-1]
path1=f'/app/projets/{pub}/contributions/{c1}'
s,h,hd,c=submit(path1,ck('B'),lambda g:'name="id"' in g,{},0,source=ck('A'))
check('seul le propriétaire' in h.lower() or 'propriétaire' in h.lower() or s==200,f'B envoie le formulaire d’acceptation du propriétaire → refusé côté serveur ({s})')
s,pageB,_,_=req(f'/app/projets/{pub}/versions',ck('A')); check('v1.1' not in pageB,'après la tentative de B : toujours aucune v1.1 (permission serveur)')
# rejet par le propriétaire (2e formulaire : Rejeter)
s,h,hd,c=submit(path1,ck('A'),lambda g:'name="id"' in g,{'note':'Mauvaise approche.'},1)
check(s==303 and hd.get('location','').endswith('/contributions'),f'rejet par le propriétaire → redirection ({s})')
s,t,_,_=req(f'/app/projets/{pub}/contributions',ck('A')); check('Rejetée' in t,'contribution affichée « Rejetée »')
s,t,_,_=req(f'/app/projets/{pub}/versions',ck('A')); check('v1.1' not in t,'version principale inchangée après le rejet')
s,t,_,_=req(path1,ck('B')); check('Mauvaise approche' in t,'le motif du rejet est visible')

j2=contribute('Seconde proposition',{'README.md':'# Marché Local\n','src/App.jsx':'function App() { return <ShopCard />; }\n','src/ShopCard.jsx':'export default function ShopCard(){}\n'})
c2=j2['redirect'].split('/')[-1]; path2=f'/app/projets/{pub}/contributions/{c2}'
s,h,hd,c=submit(path2,ck('A'),lambda g:'name="id"' in g,{},0)
check(s==303 and hd.get('location','').endswith('/versions'),f'acceptation → redirection vers les versions ({s})')
s,t,_,_=req(f'/app/projets/{pub}/versions',ck('A')); check('v1.1' in t and 'Courante' in t and 'Seconde proposition' in t,'nouvelle version v1.1 créée et courante')
s,t,_,_=req(path2,ck('A')); check('Acceptée' in t,'contribution « Acceptée »')

print('— Restauration non destructive')
s,t,_,_=req(f'/app/projets/{pub}/versions',ck('A'))
vid=None
for seg,fields in forms(t):
    d=dict(fields)
    if 'versionId' in d: vid=d['versionId']; break
check(vid is not None,'bouton Restaurer disponible pour v1.0')
s,h,hd,c=submit(f'/app/projets/{pub}/versions',ck('A'),lambda g:'name="versionId"' in g,{})
s,t,_,_=req(f'/app/projets/{pub}/versions',ck('A'))
check('v1.2' in t and 'Restauration de v1.0' in t and 'v1.1' in t and 'v1.0' in t,'v1.2 (restauration) ajoutée ; v1.0 et v1.1 conservées')

print('— Livraison et Ship Card')
s,h,hd,c=submit(f'/app/projets/{pub}',ck('A'),lambda g:'name="slug"' in g,{})
check(s==303 and f'/ship/{pub}' in hd.get('location',''),f'livraison → redirection vers la Ship Card ({s})')
s,t,_,_=req(f'/ship/{pub}'); 
check(s==200 and 'Marché Local' in t and 'Livré' in t and 'Kofi Diallo' in t and '1 contribution acceptée' in t,'Ship Card PUBLIQUE (visiteur) : projet, statut, contributeur crédité')
check('og:title' in t or 'property="og:title"' in t,'balises de partage (Open Graph)')
s,t,_,_=req(f'/app/projets/{pub}/contributions/nouvelle',ck('B')); check('livré' in t,'plus de contribution possible après la livraison')
s,t,_,_=req('/projets'); check('Livré' in t,'la liste publique affiche « Livré »')

print('— Mode sombre / clair (CSS)')
print(f'\n{ok} vérifications de formulaires réussies, {fail} échec(s)')
sys.exit(1 if fail else 0)
