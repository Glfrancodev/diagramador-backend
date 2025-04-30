const fs = require('fs').promises;
const archiver = require('archiver');
const path = require('path');
const { createWriteStream, rmSync, unlinkSync } = require('fs');
const proyectoService = require('../services/proyecto.service');

class ProyectoController {
  async crear(req, res) {
    try {
      const contenidoRecibido = JSON.parse(req.body.contenido || '{}');
  
      const contenidoConEstructura = {
        pestañas: contenidoRecibido.pestañas || [],
        clases: contenidoRecibido.clases || [],
        relaciones: contenidoRecibido.relaciones || [],
        clavesPrimarias: contenidoRecibido.clavesPrimarias || {}
      };
  
      const data = {
        ...req.body,
        idUsuario: req.usuario.idUsuario,
        contenido: JSON.stringify(contenidoConEstructura)
      };
  
      const proyecto = await proyectoService.crear(data);
      res.status(201).json(proyecto);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  

  async listar(req, res) {
    const proyectos = await proyectoService.listar();
    res.json(proyectos);
  }

  async listarPorUsuario(req, res) {
    const proyectos = await proyectoService.listarPorUsuario(req.usuario.idUsuario);
    res.json(proyectos);
  }

  async obtener(req, res) {
    try {
      const proyecto = await proyectoService.obtenerPorId(req.params.id);
      res.json(proyecto);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async actualizar(req, res) {
    try {
      const contenidoRecibido = JSON.parse(req.body.contenido || '{}');
  
      const contenidoConEstructura = {
        pestañas: contenidoRecibido.pestañas || [],
        clases: contenidoRecibido.clases || [],
        relaciones: contenidoRecibido.relaciones || [],
        clavesPrimarias: contenidoRecibido.clavesPrimarias || {}
      };
  
      const dataActualizada = {
        ...req.body,
        contenido: JSON.stringify(contenidoConEstructura)
      };
  
      const proyecto = await proyectoService.actualizar(req.params.id, req.usuario.idUsuario, dataActualizada);
      res.json(proyecto);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }
  

  async eliminar(req, res) {
    try {
      const resultado = await proyectoService.eliminar(req.params.id, req.usuario.idUsuario);
      res.json(resultado);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  async listarPermitidos(req, res) {
    try {
      const proyectos = await proyectoService.listarProyectosPermitidos(req.usuario.idUsuario);
      res.json(proyectos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async listarInvitados(req, res) {
    try {
      const proyectos = await proyectoService.listarProyectosInvitado(req.usuario.idUsuario);
      res.json(proyectos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  async exportar(req, res) {
    try {
      const idProyecto = req.params.id;
      const proyecto = await proyectoService.obtenerPorId(idProyecto);
      // Eliminar la carpeta temporal si ya existe para evitar errores de escritura
        const tempPath = path.join(__dirname, '..', 'temp', idProyecto);
        const zipPath = path.join(__dirname, '..', 'temp', `${idProyecto}.zip`);
        try {
          rmSync(tempPath, { recursive: true, force: true });
          console.log('[EXPORTAR] Carpeta temp eliminada o no existía');
        } catch (error) {
          console.warn('Advertencia al intentar limpiar carpeta temporal:', error.message);
        }

        try {
          unlinkSync(zipPath);
          console.log('[EXPORTAR] ZIP anterior eliminado o no existía');
        } catch (error) {
          console.warn('Advertencia al intentar eliminar ZIP anterior:', error.message);
        }

      if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });

      const tempDir = path.join(__dirname, '..', 'temp', idProyecto);
      const srcDir = path.join(tempDir, 'src');
      const appDir = path.join(srcDir, 'app');
      const pagesDir = path.join(appDir, 'pages');

      await fs.mkdir(pagesDir, { recursive: true });
      // Obtener las pestañas del proyecto
      const pages = JSON.parse(proyecto.contenido).pestañas;
      const primeraPestana = pages[0]?.name.toLowerCase() || 'inicio';
      let componentsImports = '';
      let componentsDeclarations = '';
      let componentsRouting = '';

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const componentName = `${page.name}Component`;
        const componentDir = path.join(pagesDir, page.name.toLowerCase());

        await fs.mkdir(componentDir, { recursive: true });

        // Crear el archivo .ts
        await fs.writeFile(path.join(componentDir, `${componentName.toLowerCase()}.component.ts`), `
import { Component } from '@angular/core';

@Component({
  selector: 'app-${page.name.toLowerCase()}',
  templateUrl: './${componentName.toLowerCase()}.component.html',
  styleUrls: ['./${componentName.toLowerCase()}.component.css']
})
export class ${componentName} {
  title = '${page.name}';
}
        `);

        // Corrección: Transformar <a href="..."> por <a [routerLink]="'/...'">
        let pageHtmlTransformado = page.html.replace(/href="([^"]+)"/g, (match, ruta) => {
          const rutaFormateada = ruta.trim().toLowerCase();
          return `[routerLink]="'/${rutaFormateada}'"`;
        });

        // Crear el archivo .html corregido
        await fs.writeFile(path.join(componentDir, `${componentName.toLowerCase()}.component.html`), pageHtmlTransformado);

        // Crear el archivo .css
        await fs.writeFile(path.join(componentDir, `${componentName.toLowerCase()}.component.css`), page.css);

        componentsImports += `import { ${componentName} } from './pages/${page.name.toLowerCase()}/${componentName.toLowerCase()}.component';\n`;
        componentsDeclarations += `${componentName},\n`;
        componentsRouting += `{ path: '${page.name.toLowerCase()}', component: ${componentName} },\n`;
      }
      // Crear app-routing.module.ts
      await fs.writeFile(path.join(appDir, 'app-routing.module.ts'), `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
${componentsImports}

const routes: Routes = [
  ${componentsRouting}
  { path: '', redirectTo: '${primeraPestana}', pathMatch: 'full' },
  { path: '**', redirectTo: '${primeraPestana}' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }`);

      // Crear app.module.ts
      await fs.writeFile(path.join(appDir, 'app.module.ts'), `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
${componentsImports}

@NgModule({
  declarations: [
  AppComponent,
  ${componentsDeclarations}
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }`);

      // ⚡ Corrección: Crear app.component.html con router-outlet
      await fs.writeFile(path.join(appDir, 'app.component.html'), `<router-outlet></router-outlet>`);

      // ⚡ Corrección: Crear styles.css
      await fs.writeFile(path.join(srcDir, 'styles.css'), `html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}`);

      // Crear package.json
      await fs.writeFile(path.join(tempDir, 'package.json'), `{
  "name": "mi-proyecto-angular",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^16.2.0",
    "@angular/common": "^16.2.0",
    "@angular/compiler": "^16.2.0",
    "@angular/core": "^16.2.0",
    "@angular/forms": "^16.2.0",
    "@angular/platform-browser": "^16.2.0",
    "@angular/platform-browser-dynamic": "^16.2.0",
    "@angular/router": "^16.2.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.13.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^16.2.14",
    "@angular/cli": "^16.2.14",
    "@angular/compiler-cli": "^16.2.0",
    "@types/jasmine": "~4.3.0",
    "jasmine-core": "~4.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.1.3"
  }
}`);

      // ⚡ Corrección: Crear angular.json (copiado literal del que me diste)
      await fs.writeFile(path.join(tempDir, 'angular.json'), `{
        "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
        "version": 1,
        "newProjectRoot": "projects",
        "projects": {
          "mi-proyecto-angular": {
            "projectType": "application",
            "schematics": {},
            "root": "",
            "sourceRoot": "src",
            "prefix": "app",
            "architect": {
              "build": {
                "builder": "@angular-devkit/build-angular:browser",
                "options": {
                  "outputPath": "dist/mi-proyecto-angular",
                  "index": "src/index.html",
                  "main": "src/main.ts",
                  "polyfills": ["zone.js"],
                  "tsConfig": "tsconfig.app.json",
                  "assets": ["src/favicon.ico", "src/assets"],
                  "styles": ["src/styles.css"],
                  "scripts": []
                },
                "configurations": {
                  "production": {
                    "budgets": [
                      { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
                      { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
                    ],
                    "outputHashing": "all"
                  },
                  "development": {
                    "buildOptimizer": false,
                    "optimization": false,
                    "vendorChunk": true,
                    "extractLicenses": false,
                    "sourceMap": true,
                    "namedChunks": true
                  }
                },
                "defaultConfiguration": "production"
              },
              "serve": {
                "builder": "@angular-devkit/build-angular:dev-server",
                "configurations": {
                  "production": { "browserTarget": "mi-proyecto-angular:build:production" },
                  "development": { "browserTarget": "mi-proyecto-angular:build:development" }
                },
                "defaultConfiguration": "development"
              },
              "extract-i18n": {
                "builder": "@angular-devkit/build-angular:extract-i18n",
                "options": {
                  "browserTarget": "mi-proyecto-angular:build"
                }
              },
              "test": {
                "builder": "@angular-devkit/build-angular:karma",
                "options": {
                  "polyfills": ["zone.js", "zone.js/testing"],
                  "tsConfig": "tsconfig.spec.json",
                  "assets": ["src/favicon.ico", "src/assets"],
                  "styles": ["src/styles.css"],
                  "scripts": []
                }
              }
            }
          }
        }
      }`);
      
            // Crear tsconfig.json
            await fs.writeFile(path.join(tempDir, 'tsconfig.json'), `{
        "compileOnSave": false,
        "compilerOptions": {
          "baseUrl": "./",
          "outDir": "./dist/out-tsc",
          "forceConsistentCasingInFileNames": true,
          "strict": true,
          "noImplicitOverride": true,
          "noPropertyAccessFromIndexSignature": true,
          "noImplicitReturns": true,
          "noFallthroughCasesInSwitch": true,
          "sourceMap": true,
          "declaration": false,
          "downlevelIteration": true,
          "experimentalDecorators": true,
          "moduleResolution": "node",
          "importHelpers": true,
          "target": "ES2022",
          "module": "ES2022",
          "useDefineForClassFields": false,
          "lib": ["ES2022", "dom"]
        },
        "angularCompilerOptions": {
          "enableI18nLegacyMessageIdFormat": false,
          "strictInjectionParameters": true,
          "strictInputAccessModifiers": true,
          "strictTemplates": true
        }
      }`);
      
            // Crear tsconfig.app.json
            await fs.writeFile(path.join(tempDir, 'tsconfig.app.json'), `{
        "extends": "./tsconfig.json",
        "compilerOptions": {
          "outDir": "./out-tsc/app",
          "types": []
        },
        "files": [
          "src/main.ts"
        ],
        "include": [
          "src/**/*.d.ts"
        ]
      }`);
      
            // Crear tsconfig.spec.json
            await fs.writeFile(path.join(tempDir, 'tsconfig.spec.json'), `{
        "extends": "./tsconfig.json",
        "compilerOptions": {
          "outDir": "./out-tsc/spec",
          "types": ["jasmine"]
        },
        "include": [
          "src/**/*.spec.ts",
          "src/**/*.d.ts"
        ]
      }`);

        // ⚡ Corrección: Crear index.html
        await fs.writeFile(path.join(srcDir, 'index.html'), `<!doctype html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>MiProyectoAngular</title>
          <base href="/">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="icon" type="image/x-icon" href="favicon.ico">
        </head>
        <body>
          <app-root></app-root>
        </body>
        </html>`);

        // ⚡ Corrección: Crear main.ts
        await fs.writeFile(path.join(srcDir, 'main.ts'), `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
        import { AppModule } from './app/app.module';

        platformBrowserDynamic().bootstrapModule(AppModule)
          .catch(err => console.error(err));`);

        // ⚡ Corrección: Crear app.component.ts
        await fs.writeFile(path.join(appDir, 'app.component.ts'), `import { Component } from '@angular/core';

        @Component({
          selector: 'app-root',
          templateUrl: './app.component.html',
          styleUrls: ['./app.component.css']
        })
        export class AppComponent {
          title = 'mi-proyecto-angular';
        }`);

        // ⚡ Corrección: Crear app.component.css (vacío)
        await fs.writeFile(path.join(appDir, 'app.component.css'), ``);

            // Crear archivo zip
            const output = createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            archive.on('error', (err) => {
              console.error('Error creando ZIP:', err);
              return res.status(500).json({ error: 'Error al crear ZIP' });
            });
            
            archive.pipe(output);
            archive.directory(tempDir, false);
            
            // FINALIZAMOS el zip
            await archive.finalize();
            
            // ESPERAMOS que se cierre el archivo en el disco
            await new Promise((resolve, reject) => {
              output.on('close', () => {
                resolve();
              });
              output.on('error', (err) => {
                console.error('[EXPORTAR] Error cerrando archivo:', err);
                reject(err);
              });
            });
            
            // YA ESTÁ CERRADO: ahora sí podemos descargar
            res.download(zipPath, `${proyecto.nombre}.zip`, (err) => {
              if (err) {
                console.error('[EXPORTAR] Error enviando ZIP:', err);
              } else {
                console.log('[EXPORTAR] Archivo enviado correctamente');
              }
              try {
                rmSync(tempDir, { recursive: true, force: true });
                unlinkSync(zipPath);
                console.log('[EXPORTAR] Archivos temporales eliminados');
              } catch (cleanupError) {
                console.error('[EXPORTAR] Error limpiando archivos temporales:', cleanupError);
              }
            });
            
  
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al exportar proyecto base' });
          }
        }

        async exportarCrudSimulado(req, res) {
          try {
            const { clases, llavesPrimarias, relaciones } = req.body;
            if (!clases || !llavesPrimarias || !relaciones) {
              return res.status(400).json({ error: 'Faltan datos requeridos' });
            }
        
            const tempDir = path.join(__dirname, '..', 'temp', 'proyectoAngular');
            const srcDir = path.join(tempDir, 'src');
            const appDir = path.join(srcDir, 'app');
            const pagesDir = path.join(appDir, 'pages');
            const servicesDir = path.join(appDir, 'services');
            const modelsDir = path.join(appDir, 'models');
            const zipPath = path.join(__dirname, '..', 'temp', 'proyectoAngular.zip');
        
            rmSync(tempDir, { recursive: true, force: true });
            try { unlinkSync(zipPath); } catch {}
        
            await fs.mkdir(pagesDir, { recursive: true });
            await fs.mkdir(servicesDir, { recursive: true });
            await fs.mkdir(modelsDir, { recursive: true });
        
            const sidebarLinks = clases.map(c =>
              `<a [routerLink]="'/${c.nombre.toLowerCase()}'">${c.nombre}</a>`
            ).join('\n');
        
            const importsArray = [];
            const declarationsArray = [];
            const routesArray = [];
        
            const relacionesPorClase = {};
            for (const rel of relaciones) {
              if (!relacionesPorClase[rel.destino]) {
                relacionesPorClase[rel.destino] = [];
              }
              relacionesPorClase[rel.destino].push(rel);
            }
        
            for (const clase of clases) {
              const nombre = clase.nombre;
              const nombreLower = nombre.toLowerCase();
              const atributos = [...clase.atributos];
              const primaryKey = llavesPrimarias[nombre];
              const pageDir = path.join(pagesDir, nombreLower);
              await fs.mkdir(pageDir, { recursive: true });
        
              const relacionesDestino = relacionesPorClase[nombre] || [];
        
              for (const rel of relacionesDestino) {
                const idForanea = `id${rel.origen}`;
                atributos.push({ nombre: idForanea, tipo: 'string', foranea: true, claseOrigen: rel.origen });
              }
        
              const modelContent = `export interface ${nombre} {
        ${atributos.map(attr => {
          const tipo = attr.nombre === primaryKey ? 'number' : 'string';
          return `  ${attr.nombre}: ${tipo};`;
        }).join('\n')}
        }`;
              await fs.writeFile(path.join(modelsDir, `${nombreLower}.model.ts`), modelContent);
        
              const serviceContent = `import { Injectable } from '@angular/core';
        import { ${nombre} } from '../models/${nombreLower}.model';
        
        @Injectable({ providedIn: 'root' })
        export class ${nombre}Service {
          private readonly STORAGE_KEY = '${nombreLower}s';
        
          private cargar(): ${nombre}[] {
            const datos = localStorage.getItem(this.STORAGE_KEY);
            return datos ? JSON.parse(datos) : [];
          }
        
          private guardar(entidades: ${nombre}[]): void {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entidades));
          }
        
          listar(): ${nombre}[] {
            return this.cargar();
          }
        
          obtenerPorId(id: number): ${nombre} | undefined {
            return this.cargar().find(e => e.${primaryKey} === id);
          }
        
          crear(entidad: ${nombre}): void {
            const entidades = this.cargar();
            entidades.push(entidad);
            this.guardar(entidades);
          }
        
          editar(id: number, actualizado: ${nombre}): void {
            const entidades = this.cargar().map(e => e.${primaryKey} === id ? actualizado : e);
            this.guardar(entidades);
          }
        
          eliminar(id: number): void {
            const entidades = this.cargar().filter(e => e.${primaryKey} !== id);
            this.guardar(entidades);
          }
        }`;
              await fs.writeFile(path.join(servicesDir, `${nombreLower}.service.ts`), serviceContent);
              const listItems = atributos.map(a => `{{ e.${a.nombre} }}`).join(' - ');
              const componentHtml = `<body>
          <div id="iroh">
            <aside id="i2uf">
              <h2 id="ijnk">Menú</h2>
              <nav id="ibjo">
                ${sidebarLinks}
              </nav>
            </aside>
            <main id="igzra">
              <h2>${nombre}</h2>
              <button [routerLink]="['/${nombreLower}/crear']">Nuevo ${nombre}</button>
              <ul>
                <li *ngFor="let e of ${nombreLower}s">
                  ${listItems}
                  <span>
                    <button (click)="editar(e.${primaryKey})">Editar</button>
                    <button (click)="eliminar(e.${primaryKey})">Eliminar</button>
                  </span>
                </li>
              </ul>
            </main>
          </div>
        </body>`;
              await fs.writeFile(path.join(pageDir, `${nombreLower}component.component.html`), componentHtml);
        
              const componentTs = `import { Component, OnInit } from '@angular/core';
        import { Router } from '@angular/router';
        import { ${nombre} } from 'src/app/models/${nombreLower}.model';
        import { ${nombre}Service } from 'src/app/services/${nombreLower}.service';
        
        @Component({
          selector: 'app-${nombreLower}',
          templateUrl: './${nombreLower}component.component.html',
          styleUrls: ['./${nombreLower}component.component.css']
        })
        export class ${nombre}Component implements OnInit {
          ${nombreLower}s: ${nombre}[] = [];
        
          constructor(private service: ${nombre}Service, private router: Router) {}
        
          ngOnInit(): void {
            this.${nombreLower}s = this.service.listar();
          }
        
          eliminar(id: number): void {
            this.service.eliminar(id);
            this.${nombreLower}s = this.service.listar();
          }
        
          editar(id: number): void {
            this.router.navigate(['/${nombreLower}/editar', id]);
          }
        }`;
              await fs.writeFile(path.join(pageDir, `${nombreLower}component.component.ts`), componentTs);
        
              // 📄 CSS
              const cssContent = `* { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
        #iroh { display: flex; min-height: 100vh; width: 100%; }
        #i2uf { flex-grow: 3; background-color: #1f2937; color: white; display: flex; flex-direction: column; padding: 1rem; }
        #ijnk { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
        #ibjo { display: flex; flex-direction: column; gap: 0.5rem; }
        #igzra { flex-grow: 7; padding: 1rem; box-sizing: border-box; min-height: 100vh; }
        ul { list-style: none; padding: 0; }
        li { background: #f1f5f9; padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; }
        button { margin-left: 0.5rem; }`;
              await fs.writeFile(path.join(pageDir, `${nombreLower}component.component.css`), cssContent);
              await fs.writeFile(path.join(pageDir, `${nombreLower}-form.component.css`), `@import './${nombreLower}component.component.css';`);
        
              // 📄 form.component.html (con select si hay relaciones)
              const formHtmlCampos = atributos
                .filter(a => a.nombre !== primaryKey)
                .map(a => {
                  const rel = a.foranea ? relacionesDestino.find(r => `id${r.origen}` === a.nombre) : null;
                  if (rel) {
                    const origenLower = rel.origen.toLowerCase();
                    return `<label>${a.nombre}:
          <select [(ngModel)]="${nombreLower}.${a.nombre}" name="${a.nombre}" required>
      <option *ngFor="let item of ${origenLower}Opciones" [value]="item.${llavesPrimarias[rel.origen]}">
        {{ ${clases.find(c => c.nombre === rel.origen).atributos.map(a => `item.${a.nombre}`).join(" + ' - ' + ")} }}
      </option>
      
          </select>
        </label><br /><br />`;
                  } else {
                    return `<label>${a.nombre}:
          <input [(ngModel)]="${nombreLower}.${a.nombre}" name="${a.nombre}" required />
        </label><br /><br />`;
                  }
                }).join('\n      ');
        
              const formHtml = `<body>
          <div id="iroh">
            <aside id="i2uf">
              <h2 id="ijnk">Menú</h2>
              <nav id="ibjo">
                ${sidebarLinks}
              </nav>
            </aside>
            <main id="igzra">
              <h2>{{ editando ? 'Editar ${nombre}' : 'Crear ${nombre}' }}</h2>
              <form (ngSubmit)="guardar()" #form="ngForm">
                ${formHtmlCampos}
                <button type="submit">{{ editando ? 'Actualizar' : 'Crear' }}</button>
              </form>
            </main>
          </div>
        </body>`;
              await fs.writeFile(path.join(pageDir, `${nombreLower}-form.component.html`), formHtml);
              const formTs = `import { Component, OnInit } from '@angular/core';
              import { ActivatedRoute, Router } from '@angular/router';
              import { ${nombre} } from 'src/app/models/${nombreLower}.model';
              import { ${nombre}Service } from 'src/app/services/${nombreLower}.service';
              ${relacionesDestino.map(rel => {
                const origen = rel.origen;
                const origenLower = origen.toLowerCase();
                return `import { ${origen} } from 'src/app/models/${origenLower}.model';
              import { ${origen}Service } from 'src/app/services/${origenLower}.service';`;
              }).join('\n')}
              
              @Component({
                selector: 'app-${nombreLower}-form',
                templateUrl: './${nombreLower}-form.component.html',
                styleUrls: ['./${nombreLower}-form.component.css']
              })
              export class ${nombre}FormComponent implements OnInit {
                ${nombreLower}: ${nombre} = {
                  ${atributos.map(a => {
                    const valor = a.nombre === primaryKey ? '0' : "''";
                    return `${a.nombre}: ${valor}`;
                  }).join(',\n    ')}
                };
                editando = false;
              ${relacionesDestino.map(rel => `  ${rel.origen.toLowerCase()}Opciones: ${rel.origen}[] = [];`).join('\n')}
              
                constructor(
                  private route: ActivatedRoute,
                  private router: Router,
                  private service: ${nombre}Service,
              ${relacionesDestino.map(rel => `    private ${rel.origen.toLowerCase()}Service: ${rel.origen}Service,`).join('\n')}
                ) {}
              
                ngOnInit(): void {
                  const id = this.route.snapshot.paramMap.get('id');
                  if (id) {
                    const encontrado = this.service.obtenerPorId(+id);
                    if (encontrado) {
                      this.${nombreLower} = { ...encontrado };
                      this.editando = true;
                    }
                  }
              ${relacionesDestino.map(rel => {
                const o = rel.origen.toLowerCase();
                return `    this.${o}Opciones = this.${o}Service.listar();`;
              }).join('\n')}
                }
              
                guardar(): void {
                  if (this.editando) {
                    this.service.editar(this.${nombreLower}.${primaryKey}, this.${nombreLower});
                  } else {
                    this.${nombreLower}.${primaryKey} = Date.now(); // autogenerado
                    this.service.crear(this.${nombreLower});
                  }
                  this.router.navigate(['/${nombreLower}']);
                }
              }`;
                    await fs.writeFile(path.join(pageDir, `${nombreLower}-form.component.ts`), formTs);
              
                    // Acumulación para app.module y routing
                    importsArray.push(
                      `import { ${nombre}Component } from './pages/${nombreLower}/${nombreLower}component.component';\nimport { ${nombre}FormComponent } from './pages/${nombreLower}/${nombreLower}-form.component';`
                    );
                    declarationsArray.push(`${nombre}Component`, `${nombre}FormComponent`);
                    routesArray.push(
                      `{ path: '${nombreLower}', component: ${nombre}Component }`,
                      `{ path: '${nombreLower}/crear', component: ${nombre}FormComponent }`,
                      `{ path: '${nombreLower}/editar/:id', component: ${nombre}FormComponent }`
                    );
                  }
                  const primeraRuta = clases[0]?.nombre.toLowerCase() || 'inicio';
                  await fs.writeFile(path.join(appDir, 'app-routing.module.ts'), `
              import { NgModule } from '@angular/core';
              import { RouterModule, Routes } from '@angular/router';
              ${importsArray.join('\n')}
              
              const routes: Routes = [
                ${routesArray.join(',\n  ')},
                { path: '', redirectTo: '${primeraRuta}', pathMatch: 'full' },
                { path: '**', redirectTo: '${primeraRuta}' }
              ];
              
              @NgModule({
                imports: [RouterModule.forRoot(routes)],
                exports: [RouterModule]
              })
              export class AppRoutingModule { }
              `);
              
                  await fs.writeFile(path.join(appDir, 'app.module.ts'), `
              import { NgModule } from '@angular/core';
              import { BrowserModule } from '@angular/platform-browser';
              import { FormsModule } from '@angular/forms';
              import { AppRoutingModule } from './app-routing.module';
              import { AppComponent } from './app.component';
              ${importsArray.join('\n')}
              
              @NgModule({
                declarations: [
                  AppComponent,
                  ${declarationsArray.join(',\n    ')}
                ],
                imports: [
                  BrowserModule,
                  FormsModule,
                  AppRoutingModule
                ],
                providers: [],
                bootstrap: [AppComponent]
              })
              export class AppModule { }
              `);
              
                  await fs.writeFile(path.join(appDir, 'app.component.ts'), `
              import { Component } from '@angular/core';
              
              @Component({
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.css']
              })
              export class AppComponent {
                title = 'mi-proyecto-angular';
              }
              `);
                  await fs.writeFile(path.join(appDir, 'app.component.html'), `<router-outlet></router-outlet>`);
                  await fs.writeFile(path.join(appDir, 'app.component.css'), ``);
                  await fs.writeFile(path.join(srcDir, 'styles.css'), `html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }`);
              
                  await fs.writeFile(path.join(srcDir, 'main.ts'), `
              import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
              import { AppModule } from './app/app.module';
              
              platformBrowserDynamic().bootstrapModule(AppModule)
                .catch(err => console.error(err));`);
              
                  await fs.writeFile(path.join(srcDir, 'index.html'), `
              <!doctype html>
              <html lang="es">
              <head>
                <meta charset="utf-8">
                <title>mi-proyecto-angular</title>
                <base href="/">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="icon" type="image/x-icon" href="favicon.ico">
              </head>
              <body>
                <app-root></app-root>
              </body>
              </html>`);
              
                  await fs.writeFile(path.join(tempDir, 'angular.json'), `{
                "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
                "version": 1,
                "newProjectRoot": "projects",
                "projects": {
                  "mi-proyecto-angular": {
                    "projectType": "application",
                    "schematics": {},
                    "root": "",
                    "sourceRoot": "src",
                    "prefix": "app",
                    "architect": {
                      "build": {
                        "builder": "@angular-devkit/build-angular:browser",
                        "options": {
                          "outputPath": "dist/mi-proyecto-angular",
                          "index": "src/index.html",
                          "main": "src/main.ts",
                          "polyfills": ["zone.js"],
                          "tsConfig": "tsconfig.app.json",
                          "assets": ["src/favicon.ico", "src/assets"],
                          "styles": ["src/styles.css"],
                          "scripts": []
                        },
                        "configurations": {
                          "production": {
                            "budgets": [
                              { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
                              { "type": "anyComponentStyle", "maximumWarning": "2kb", "maximumError": "4kb" }
                            ],
                            "outputHashing": "all"
                          },
                          "development": {
                            "buildOptimizer": false,
                            "optimization": false,
                            "vendorChunk": true,
                            "extractLicenses": false,
                            "sourceMap": true,
                            "namedChunks": true
                          }
                        },
                        "defaultConfiguration": "production"
                      },
                      "serve": {
                        "builder": "@angular-devkit/build-angular:dev-server",
                        "configurations": {
                          "production": { "browserTarget": "mi-proyecto-angular:build:production" },
                          "development": { "browserTarget": "mi-proyecto-angular:build:development" }
                        },
                        "defaultConfiguration": "development"
                      },
                      "extract-i18n": {
                        "builder": "@angular-devkit/build-angular:extract-i18n",
                        "options": {
                          "browserTarget": "mi-proyecto-angular:build"
                        }
                      },
                      "test": {
                        "builder": "@angular-devkit/build-angular:karma",
                        "options": {
                          "polyfills": ["zone.js", "zone.js/testing"],
                          "tsConfig": "tsconfig.spec.json",
                          "assets": ["src/favicon.ico", "src/assets"],
                          "styles": ["src/styles.css"],
                          "scripts": []
                        }
                      }
                    }
                  }
                }
              }`);
              
                  await fs.writeFile(path.join(tempDir, 'package.json'), `{
                "name": "mi-proyecto-angular",
                "version": "0.0.0",
                "scripts": {
                  "ng": "ng",
                  "start": "ng serve",
                  "build": "ng build",
                  "watch": "ng build --watch --configuration development",
                  "test": "ng test"
                },
                "private": true,
                "dependencies": {
                  "@angular/animations": "^16.2.0",
                  "@angular/common": "^16.2.0",
                  "@angular/compiler": "^16.2.0",
                  "@angular/core": "^16.2.0",
                  "@angular/forms": "^16.2.0",
                  "@angular/platform-browser": "^16.2.0",
                  "@angular/platform-browser-dynamic": "^16.2.0",
                  "@angular/router": "^16.2.0",
                  "rxjs": "~7.8.0",
                  "tslib": "^2.3.0",
                  "zone.js": "~0.13.0"
                },
                "devDependencies": {
                  "@angular-devkit/build-angular": "^16.2.14",
                  "@angular/cli": "^16.2.14",
                  "@angular/compiler-cli": "^16.2.0",
                  "typescript": "~5.1.3"
                }
              }`);
              
                  await fs.writeFile(path.join(tempDir, 'tsconfig.json'), `{
                "compileOnSave": false,
                "compilerOptions": {
                  "baseUrl": "./",
                  "outDir": "./dist/out-tsc",
                  "strict": true,
                  "sourceMap": true,
                  "module": "ES2022",
                  "target": "ES2022",
                  "moduleResolution": "node",
                  "experimentalDecorators": true,
                  "useDefineForClassFields": false,
                  "lib": ["ES2022", "dom"]
                }
              }`);
              
                  await fs.writeFile(path.join(tempDir, 'tsconfig.app.json'), `{
                "extends": "./tsconfig.json",
                "compilerOptions": {
                  "outDir": "./out-tsc/app",
                  "types": []
                },
                "files": ["src/main.ts"],
                "include": ["src/**/*.d.ts"]
              }`);
              
                  const output = createWriteStream(zipPath);
                  const archive = archiver('zip', { zlib: { level: 9 } });
                  archive.pipe(output);
                  archive.directory(tempDir, false);
                  await archive.finalize();
              
                  await new Promise((resolve, reject) => {
                    output.on('close', resolve);
                    output.on('error', reject);
                  });
              
                  res.download(zipPath, 'proyectoAngular.zip', err => {
                    if (err) console.error('[Descarga ZIP] Error:', err);
                    try {
                      rmSync(tempDir, { recursive: true, force: true });
                      unlinkSync(zipPath);
                    } catch (e) {
                      console.warn('[Limpieza ZIP] Error al limpiar temporales:', e);
                    }
                  });
                } catch (error) {
                  console.error('[exportarCrudSimulado] Error:', error);
                  return res.status(500).json({ error: 'Error al exportar CRUD simulado' });
                }
              }
                          
      
      }
      
      module.exports = new ProyectoController();
      