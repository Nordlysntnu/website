import { test, expect, type Page } from '@playwright/test'
import { readFile, readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const exec=promisify(execFile)
const dataDir=process.env.NORDLYS_BROWSER_DATA_DIR!
type Account={name:string;email:string;password:string;role:string}
const accounts:Account[]=JSON.parse(await readFile(path.join(dataDir,'accounts.json'),'utf8'))
const admin=accounts.find(a=>a.role==='admin')!
const publisher=accounts.find(a=>a.role==='publisher')!
const screenshotDir=path.join(dataDir,'screenshots')
await mkdir(screenshotDir,{recursive:true})
async function login(page:Page,account:Account){
  await page.goto('/admin/login')
  await page.getByLabel(/^Email/i).fill(account.email)
  await page.locator('input[type="password"]').fill(account.password)
  await page.getByRole('button',{name:/^Log ?in$/i}).click()
  await expect(page.getByRole('heading',{name:/Good stories|Your next story/})).toBeVisible()
}
async function noOverflow(page:Page){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true)
}
async function readableHeading(page:Page,name:string){
  const contrast=await page.getByRole('heading',{name,exact:true}).evaluate(heading=>{
    const luminance=(color:string)=>{
      const rgb=(color.match(/[\d.]+/g)||[]).slice(0,3).map(Number).map(c=>{const s=c/255;return s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4})
      return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722
    }
    let ancestor:Element|null=heading
    let background=''
    while(ancestor){background=getComputedStyle(ancestor).backgroundColor;if(background!=='rgba(0, 0, 0, 0)'&&background!=='transparent')break;ancestor=ancestor.parentElement}
    const values=[luminance(getComputedStyle(heading).color),luminance(background)].sort((a,b)=>b-a)
    return (values[0]+0.05)/(values[1]+0.05)
  })
  expect(contrast).toBeGreaterThanOrEqual(3) // Large headline contrast, including inherited global styles.
}
async function publishOnce(){
  await exec(process.execPath,['--import','tsx','scripts/publish-worker.ts','--once'],{cwd:process.cwd(),
    env:process.env,windowsHide:true,timeout:600000,maxBuffer:1024*1024})
}
test('dark default, persistent light choice and mobile layout',async({browser})=>{
  for(const size of [{width:1280,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport:size,colorScheme:'light'})
    const page=await context.newPage()
    await page.goto('/admin/login')
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark')
    await noOverflow(page)
    await page.screenshot({path:path.join(screenshotDir,'login-dark-'+size.width+'.png'),fullPage:true})
    await login(page,admin)
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark')
    await page.getByRole('button',{name:'Switch to light mode'}).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme','light')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme','light')
    await noOverflow(page)
    await expect(page.getByRole('region',{name:'Website publication'})).not.toContainText('Checking publication status')
    await page.screenshot({path:path.join(screenshotDir,'dashboard-light-'+size.width+'.png'),fullPage:true})
    await page.goto('/my-posts')
    await expect(page.locator('html')).toHaveAttribute('data-theme','light')
    await page.getByRole('button',{name:'Switch to dark mode'}).click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark')
    await noOverflow(page)
    await context.close()
  }
})
test('invite, write, request changes, resubmit, publish and protect the public copy',async({browser})=>{
  test.setTimeout(720000)
  const adminContext=await browser.newContext()
  const adminPage=await adminContext.newPage()
  await login(adminPage,admin)
  await adminPage.goto('/admin/collections/users')
  const invite=adminPage.locator('.account-invite')
  const writer:Account={name:'Invited browser writer',role:'marketing',email:randomUUID()+'@browser.example.test',password:'Browser writer password '+randomUUID()}
  await invite.getByLabel('Name',{exact:true}).fill(writer.name)
  await invite.getByLabel('Email',{exact:true}).fill(writer.email)
  const invited=adminPage.waitForResponse(r=>r.url().endsWith('/api/users/invite')&&r.request().method()==='POST')
  await invite.getByRole('button',{name:'Send invitation'}).click()
  expect((await invited).status()).toBe(201)
  let link=''
  await expect.poll(async()=>{
    for(const name of await readdir(path.join(dataDir,'outbox'))){
      const mail=JSON.parse(await readFile(path.join(dataDir,'outbox',name),'utf8'))
      if(mail.to===writer.email)link=String(mail.html).match(/href="([^"]+)"/)![1]
    }
    return Boolean(link)
  }).toBe(true)
  const setupContext=await browser.newContext()
  const setupPage=await setupContext.newPage()
  await setupPage.goto(link)
  const passwordFields=setupPage.locator('input[type="password"]')
  await expect(passwordFields.first()).toBeVisible()
  // Payload registers throttled field validation while typing. Exercise real keyboard input.
  for(let index=0;index<await passwordFields.count();index++)await passwordFields.nth(index).pressSequentially(writer.password,{delay:15})
  await passwordFields.last().press('Tab')
  const reset=setupPage.waitForResponse(r=>r.url().includes('/api/users/reset-password')&&r.request().method()==='POST')
  await setupPage.getByRole('button',{name:/Reset Password|Set password/i}).click()
  expect((await reset).status()).toBe(200)
  await setupContext.close()
  const writerContext=await browser.newContext()
  const page=await writerContext.newPage()
  await login(page,writer)
  await page.getByRole('link',{name:'Write an article →',exact:true}).click()
  await expect(page.getByLabel('Responsible reviewer')).toBeEnabled()
  const title='A browser-tested Nordlys story '+randomUUID().slice(0,8)
  await page.getByLabel(/Article title/).fill(title)
  await page.getByLabel(/Short introduction/).fill('A local end-to-end test of the Nordlys publishing workflow.')
  await page.locator('[contenteditable="true"]').first().fill('The team tested the complete editorial workflow. This approved story is built into a static website before the active version changes.')
  await page.getByLabel('Responsible reviewer').selectOption({label:publisher.name})
  // Writer drafts are saved automatically; the writer has no publish/save-as-published button.
  await page.waitForURL(/\/admin\/collections\/posts\/\d+(?:\?.*)?$/)
  const id=Number(new URL(page.url()).pathname.split('/').pop())
  expect(id).toBeGreaterThan(0)
  await expect.poll(async()=>{
    const response=await page.request.get('/api/posts/'+id+'?draft=true&depth=0',{headers:{Origin:'http://127.0.0.1:3010'}})
    const post=await response.json()
    return post.title===title&&post.reviewerName===publisher.name&&JSON.stringify(post.content).includes('complete editorial workflow')
  }).toBe(true)
  await page.goto('/admin/collections/posts/'+id)
  await expect(page.getByLabel('Responsible reviewer')).toBeEnabled()
  await page.getByRole('button',{name:'Send for review',exact:true}).click()
  await expect(page.getByRole('button',{name:'Withdraw review request',exact:true})).toBeVisible()
  await page.screenshot({path:path.join(screenshotDir,'writer-review-desktop.png'),fullPage:true})
  await page.goto('/my-posts')
  await expect(page.getByText(title,{exact:true})).toBeVisible()
  await expect(page.getByText('Waiting for review',{exact:false})).toBeVisible()
  const publisherContext=await browser.newContext()
  const review=await publisherContext.newPage()
  await login(review,publisher)
  await expect(review.getByRole('region',{name:'Assigned to you'}).getByText(title,{exact:false})).toBeVisible()
  await review.goto('/admin/collections/posts/'+id)
  await review.getByRole('button',{name:'Request changes',exact:true}).click()
  const feedback='Add one concrete result before publishing. PRIVATE_REVIEW_BROWSER'
  await review.getByLabel('What should the writer change?').fill(feedback)
  await review.getByRole('button',{name:'Save and request changes',exact:true}).click()
  await expect(review.getByText('Changes requested',{exact:true}).last()).toBeVisible()
  await review.goto('/admin') // Release the editor lock before the writer opens it.
  await page.goto('/admin/collections/posts/'+id)
  await expect(page.getByText(feedback,{exact:true})).toBeVisible()
  await page.locator('[contenteditable="true"]').first().fill('The team completed 24 laps during the local test. This approved article demonstrates writing, useful feedback and a successful second review.')
  await page.getByRole('button',{name:'Send again for review',exact:true}).click()
  await expect(page.getByRole('button',{name:'Withdraw review request',exact:true})).toBeVisible()
  await page.goto('/my-posts')
  await review.goto('/admin/collections/posts/'+id)
  await review.getByRole('button',{name:/^Publish changes$/i}).click()
  await expect.poll(async()=>{
    const response=await review.request.get('/api/posts/'+id+'?draft=false&depth=0',{headers:{Origin:'http://127.0.0.1:3010'}})
    const value=await response.json()
    return value._status
  }).toBe('published')
  await review.goto('/admin')
  await expect(review.getByRole('region',{name:'Website publication'})).toContainText(/Waiting for a website update/)
  await publishOnce()
  await review.reload()
  await expect(review.getByRole('region',{name:'Website publication'})).toContainText('Local website preview is ready.')
  const website=await browser.newPage()
  await website.route('**/*',route=>{const host=new URL(route.request().url()).hostname;return /(^|\.)(google-analytics\.com|googletagmanager\.com)$/.test(host)||host==='script.google.com'?route.abort():route.continue()})
  await website.goto('http://127.0.0.1:4178/blog')
  await expect(website.getByRole('heading',{name:title,exact:true})).toBeVisible()
  await readableHeading(website,title)
  const legacyHref=await website.locator('a[href^="/blog/legacy-"]').first().getAttribute('href')
  expect(legacyHref).toMatch(/^\/blog\/legacy-/)
  const cards=website.locator('article')
  expect(await cards.count()).toBe(10) // Nine preserved articles plus the new approved one.
  await expect.poll(()=>website.locator('article img').evaluateAll(images=>images.length===9&&images.every(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0))).toBe(true)
  expect(await website.content()).not.toContain('PRIVATE_REVIEW_BROWSER')
  await website.getByRole('heading',{name:title,exact:true}).getByRole('link').click()
  await expect(website.getByText(/The team completed 24 laps/)).toBeVisible()
  await readableHeading(website,title)
  await website.screenshot({path:path.join(screenshotDir,'published-article-desktop.png'),fullPage:true})
  await website.setViewportSize({width:390,height:844})
  await noOverflow(website)
  await website.screenshot({path:path.join(screenshotDir,'published-article-mobile.png'),fullPage:true})
  await website.goto('http://127.0.0.1:4178'+legacyHref)
  await expect(website.locator('article img').first()).toBeVisible()
  await website.goto('http://127.0.0.1:4178/')
  await expect(website.getByRole('heading',{name:title,exact:true})).toBeVisible()
  const before=JSON.parse(await readFile(path.join(dataDir,'publishing/active.json'),'utf8'))
  await page.goto('/admin/collections/posts/'+id)
  await page.getByLabel(/Article title/).fill('PRIVATE_UNPUBLISHED_BROWSER_REVISION')
  await expect.poll(async()=>{const response=await page.request.get('/api/posts/'+id+'?draft=true&depth=0',{headers:{Origin:'http://127.0.0.1:3010'}});return (await response.json()).title}).toBe('PRIVATE_UNPUBLISHED_BROWSER_REVISION')
  await page.goto('/my-posts')
  await publishOnce()
  expect(JSON.parse(await readFile(path.join(dataDir,'publishing/active.json'),'utf8'))).toEqual(before)
  await website.goto('http://127.0.0.1:4178/blog/'+id)
  await expect(website.getByRole('heading',{name:title,exact:true})).toBeVisible()
  expect(await website.content()).not.toContain('PRIVATE_UNPUBLISHED_BROWSER_REVISION')
  await adminContext.close();await writerContext.close();await publisherContext.close();await website.close()
})
