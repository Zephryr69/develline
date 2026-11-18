"""Test HTTP de bout en bout contre un serveur Next démarré sur la base préparée par seed-e2e.ts."""
import json,re,io,zipfile,urllib.request,urllib.error,sys
S=json.load(open('/tmp/seed.json'))
B='http://localhost:3222'
class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**k): return None
op=urllib.request.build_opener(NoRedir)
def get(path,tok=None,method='GET',data=None,headers=None):
    h={'Cookie':f'dl_session={S[tok]}'} if tok else {}
    if headers: h.update(headers)
    req=urllib.request.Request(B+path,data=data,headers=h,method=method)
    try:
        r=op.open(req); return r.status,r.read(),{k.lower():v for k,v in r.headers.items()}
    except urllib.error.HTTPError as e:
        return e.code,e.read(),{k.lower():v for k,v in e.headers.items()}
ok=fail=0
def check(c,l):
    global ok,fail
    if c: ok+=1; print('  ✓',l)
    else: fail+=1; print('  ✗ ÉCHEC :',l)
pub,priv=S['pub'],S['priv']
T=lambda b: b.decode('utf8')
print('— Pages publiques')
for p,txt in [('/','Livrez vos projets en équipe'),('/projets','Marché Local'),(f'/projets/{pub}','Marché Local'),('/connexion','Content de vous revoir'),('/inscription','Créer votre compte'),('/ressources/securite','Aucune exécution'),('/ressources/faq','Git')]:
    s,b,_=get(p); check(s==200 and txt in T(b),f'{p} → {s} contient « {txt} »')
s,b,_=get('/projets?q=marche'); check('Marché Local' in T(b),'recherche sans accent : « marche » trouve « Marché Local »')
s,b,_=get('/projets?q=zzzz'); check('Aucun projet trouvé' in T(b),'recherche sans résultat')
s,b,_=get(f'/projets/{priv}'); check(s==404,'projet privé : 404 pour un visiteur')
s,b,_=get(f'/ship/{pub}'); check(s==404,'Ship Card non publiée : 404 pour un visiteur (projet non livré)')
s,b,_=get('/ressources/inconnu'); check(s==404,'ressource inconnue : 404')
html=T(get('/')[1])
check('dataset.theme' in html and 'dl-theme' in html,'script de thème clair/sombre présent avant le rendu')
check('prototype' not in html.lower() and 'wireframe' not in html.lower(),'aucune mention « prototype » / « wireframe » sur la landing')

land=T(get('/')[1])
for t in ['Lancer mon projet','Voir un exemple livré','Pourquoi vos projets restent à moitié finis','De l’idée au lien partageable en 4 étapes','Les réponses avant que vous ne les posiez','Dans 6 semaines, votre projet peut être en ligne']:
    check(t in land,f'accueil : « {t} »')
check('Aperçu de DEVEL line' in land and '<svg viewBox="0 0 640 560"' in land,'héros : illustration produit (SVG) présente')
check('Prouvez-le avec un lien' in land,'héros : message principal')
check('aria-label="Passer en mode' in land,'bascule de thème dans la barre d’en-tête')
for tex in ['/textures/speckle-dark.png','/textures/speckle-light.png']:
    s_,b_,h_=get(tex); check(s_==200 and h_.get('content-type','').startswith('image/png'),f'texture {tex} servie')
print('— Protection des pages connectées')
s,b,h=get('/app'); check(s in (307,308) and '/connexion' in h.get('location',''),f'/app sans session → redirection vers la connexion ({s})')
s,b,h=get(f'/app/projets/{pub}'); check(s in (307,308),'projet sans session → redirection')
s,b,_=get('/api/projects/'+pub+'/download'); check(s==403,'téléchargement sans session → 403')

print('— Propriétaire (Aïcha)')
for p,txt in [('/app','Marché Local'),('/app/projets/nouveau','Créer un projet'),(f'/app/projets/{pub}','Prêt à livrer'),(f'/app/projets/{pub}/fichiers','README.md'),(f'/app/projets/{pub}/contributions','Aucune contribution'),(f'/app/projets/{pub}/versions','v1.0'),(f'/app/projets/{pub}/membres','Kofi Diallo'),(f'/app/projets/{pub}/parametres','Paramètres du projet'),('/app/profil','Aïcha Mensah')]:
    s,b,_=get(p,'A'); check(s==200 and txt in T(b),f'{p} → {s} contient « {txt} »')
s,b,_=get(f'/app/projets/{pub}/fichiers?v=v1.0&file=src%2FApp.jsx','A'); check('function App' in T(b),'aperçu du contenu d’un fichier')

print('— Copie de travail (téléchargement)')
s,b,h=get(f'/api/projects/{pub}/download?v=v1.0','B')
z=zipfile.ZipFile(io.BytesIO(b)); names=sorted(z.namelist())
check(s==200 and h.get('content-type')=='application/zip' and 'DEVELLINE.json' in names and 'src/App.jsx' in names,f'ZIP de la version v1.0 : {names}')
manifest=json.loads(z.read('DEVELLINE.json')); check(manifest['version']=='v1.0' and manifest['project']==S['pubId'],'manifeste DEVELLINE.json correct')
s,b,_=get(f'/api/projects/{pub}/download?v=v9.9','B'); check(s==404,'version inexistante → 404')
s,b,_=get(f'/api/projects/{pub}/download','C'); check(s==403,'intrus : téléchargement refusé (403)')
s,b,_=get(f'/api/projects/{priv}/download','B'); check(s==403,'projet privé : téléchargement refusé pour un non-membre')

print('— Permissions des pages')
s,b,_=get(f'/app/projets/{priv}','C'); check(s==200 and 'Accès refusé' in T(b),'intrus sur projet privé → « Accès refusé »')
s,b,h=get(f'/app/projets/{pub}','C'); check(s in (307,308) and f'/projets/{pub}' in h.get('location',''),'visiteur connecté sur projet public → fiche publique')
s,b,_=get(f'/app/projets/{pub}/parametres','B'); check('Accès refusé' in T(b),'contributeur : paramètres refusés')
s,b,_=get(f'/app/projets/{pub}/fichiers','B'); check(s==200 and 'README.md' in T(b),'contributeur : voit les fichiers')
s,b,_=get(f'/app/projets/{pub}','B'); check('Prêt à livrer' not in T(b) and 'Proposer une contribution' in T(b),'contributeur : pas de bouton de livraison, peut proposer')

print('— Dépôt de contribution par API (B)')
def multipart(fields,fname,fbytes):
    bd='----dl'+'x'*10; out=b''
    for k,v in fields.items(): out+=f'--{bd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    if fname: out+=f'--{bd}\r\nContent-Disposition: form-data; name="file"; filename="{fname}"\r\nContent-Type: application/zip\r\n\r\n'.encode()+fbytes+b'\r\n'
    out+=f'--{bd}--\r\n'.encode(); return out,{'Content-Type':f'multipart/form-data; boundary={bd}'}
def mkzip(files):
    bio=io.BytesIO()
    with zipfile.ZipFile(bio,'w',zipfile.ZIP_DEFLATED) as zz:
        for k,v in files.items(): zz.writestr(k,v)
    return bio.getvalue()
good=mkzip({'README.md':'# Marché Local\n','src/App.jsx':'function App() { return <ShopCard />; }\n','src/ShopCard.jsx':'export default function ShopCard(){}\n'})
f={'title':'Ajout de la vitrine','summary':'Ajout du composant ShopCard et mise à jour de App.','base':'v1.0'}
d,hd=multipart(f,'v1.zip',good)
s,b,_=get(f'/api/projects/{pub}/contributions','C','POST',d,hd); check(s==403,f'intrus ne peut pas déposer ({s})')
s,b,_=get(f'/api/projects/{pub}/contributions',None,'POST',d,hd); check(s==401,f'sans session → 401 ({s})')
bad=mkzip({'src/App.jsx':'ok','.env':'SECRET=1'})
d,hd=multipart(f,'bad.zip',bad)
s,b,_=get(f'/api/projects/{pub}/contributions','B','POST',d,hd); j=json.loads(b)
check(s==422 and not j['ok'] and any('.env' in i for i in j['issues']),f'archive dangereuse refusée (422) : {j.get("issues")}')
d,hd=multipart(f,'notzip.zip',b'ceci n est pas un zip')
s,b,_=get(f'/api/projects/{pub}/contributions','B','POST',d,hd); check(s==422,'faux ZIP refusé')
d,hd=multipart(f,None,b'')
s,b,_=get(f'/api/projects/{pub}/contributions','B','POST',d,hd); check(s==400,'sans fichier → 400')
d,hd=multipart(f,'v1.zip',good)
s,b,_=get(f'/api/projects/{pub}/contributions','B','POST',d,hd); j=json.loads(b)
check(s==200 and j['ok'] and '/contributions/' in j['redirect'],f'archive valide acceptée → {j.get("redirect")}')
cid=j['redirect'].split('/')[-1]

print('— Revue par le propriétaire')
s,b,_=get(f'/app/projets/{pub}/contributions','A'); t=T(b)
check('Ajout de la vitrine' in t and 'En validation' in t,'contribution listée « En validation »')
s,b,_=get(f'/app/projets/{pub}/contributions/{cid}','A'); t=T(b)
check(s==200 and 'Accepter la contribution' in t and 'Rejeter' in t,'boutons Accepter / Rejeter visibles pour le propriétaire')
check('Ajouté' in t and 'Modifié' in t and 'ShopCard' in t,'fichiers ajoutés / modifiés listés')
s,b,_=get(f'/app/projets/{pub}/contributions/{cid}?file=src%2FApp.jsx','A'); t=T(b)
check('ShopCard' in t and 'Home' in t and re.search(r'\+\s*<?!?-*\s*>?1',t) is not None or 'aria-label="ajout"' in t,'diff ligne par ligne affiché')
s,b,_=get(f'/app/projets/{pub}/contributions/{cid}','B'); t=T(b)
check(s==200 and 'Accepter la contribution' not in t,'le contributeur ne voit pas les boutons de décision')
s,b,h=get(f'/app/projets/{pub}/contributions/{cid}','C'); check(s in (307,308),'intrus redirigé')
print(f'\n{ok} vérifications HTTP réussies, {fail} échec(s)')
sys.exit(1 if fail else 0)
