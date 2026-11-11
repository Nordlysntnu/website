import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { blogs } from '../../src/shared/data/blog'
import { legacyKeyFor } from '../../src/features/cms/legacy-posts.mjs'
const file=path.resolve('../src/shared/data/blog.tsx')
let source=(await readFile(file,'utf8')).replaceAll('\r\n','\n')
const tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
let array: ts.ArrayLiteralExpression | undefined
function visit(node: ts.Node) { if(ts.isVariableDeclaration(node)&&node.name.getText(tree)==='blogs'&&node.initializer&&ts.isArrayLiteralExpression(node.initializer))array=node.initializer;ts.forEachChild(node,visit) }
visit(tree)
if(!array||array.elements.length!==blogs.length)throw new Error('Could not locate the legacy article array.')
const inserts: {at:number;key:string}[]=[]
for(const [index,element] of array.elements.entries()){
  if(!ts.isObjectLiteralExpression(element))throw new Error('Legacy entries must be object literals.')
  if(!element.properties.some(p=>p.name?.getText(tree).replaceAll('"','').replaceAll("'",'')==='legacyKey'))inserts.push({at:element.getStart(tree)+1,key:legacyKeyFor(blogs[index])})
}
for(const item of inserts.sort((a,b)=>b.at-a.at))source=source.slice(0,item.at)+'\n    legacyKey: '+JSON.stringify(item.key)+','+source.slice(item.at)
if(inserts.length)await writeFile(file,source)
console.log('Stable legacy article keys: '+blogs.length+' ('+inserts.length+' added).')
