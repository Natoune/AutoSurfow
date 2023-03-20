# Auto Surfow
Auto Surfow est un logiciel en ligne de commande permettant d'automatiser le système d'échange de trafic du site Surfow.  
Cela peut-être utile notamment pour se connecter à plusieurs comptes en même temps, ou pour automatiser le surf sur des serveurs fonctionnant avec NodeJS.  

## Installation
Pour installer Auto Surfow sur Windows x64, rendez-vous dans la section [Releases](https://github.com/Natoune/AutoSurfow/releases) et téléchargez le fichier correspondant à votre système d'exploitation.

## Utilisation
### Mode automatique
Une fois le programme lancé, il vous suffit de suivre les instructions affichées dans le terminal pour vous connecter à votre compte Surfow.  
Si vous souhaitez ajouter un grand nombre de comptes, vous pouvez utiliser le fichier `accounts.txt` et le remplir avec les identifiants de vos comptes en respectant le format suivant :  
```txt
username1:password1
username2:password2
...
```

### Mode ligne de commande
Vous pouvez également indiquer les identifiants de votre compte en ligne de commande.
```bash
$ node . --user "username" --password "password"
```

## Build
Pour compiler le programme en exécutable, utilisez `npm run build`.  
Le fichier `auto-surfow-win64.exe` sera alors disponible dans le dossier `build`.
Pour modifier les paramètres de compilation, ainsi que le système d'exploitation cible, modifiez le fichier `build.js`.  
Indiquez dans la variable `targets` (ligne 31) le.s système.s d'exploitation cible.s et la version de NodeJS en suivant la syntaxe suivante :  
```js
targets: [
    'os-arch-nodeVersion'
]
```
Pour plus d'informations, consultez la documentation de [nexe](https://github.com/nexe/nexe).

## Licence
Auto Surfow est distribué sous licence MIT.
