import {test,expect,type Page} from '@playwright/test';
const message='Hello Amina, may we discuss a distribution partnership?';
async function prepare(page:Page){
  await page.goto('/');
  await expect(page.getByText('Workspace connected',{exact:true})).toBeVisible();
  await page.getByLabel('What do you want to achieve?').fill('Find a distribution partner in Kenya');
  await page.getByLabel('Amina — East Africa Distribution',{exact:true}).check();
  await page.getByLabel('Message to review').fill(message);
  await page.getByRole('button',{name:'Research and prepare'}).click();
  await expect(page.getByRole('heading',{name:'Waiting for your decision'})).toBeVisible();
}
test.beforeEach(async({context,request})=>{
  await request.post('/__test/reset');
  await context.addCookies([{name:'test-session',value:'owner'.repeat(9),url:'http://127.0.0.1:4173'}]);
});

test('research, review, keyboard approval and outcome use the real handler',async({page,request},testInfo)=>{
  await prepare(page);
  await expect(page.getByText(message,{exact:true})).toBeVisible();
  await expect(page.getByText('Partnership interest: Seeking distribution partners')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('review.png'),fullPage:true});
  expect((await (await request.get('/__test/counts')).json()).sends).toBe(0);
  const approve=page.getByRole('button',{name:'Approve and send'});
  await approve.focus();await page.keyboard.press('Enter');
  await expect(page.getByText('Your message was sent. The outcome is saved in Memory.')).toBeVisible();
  expect(await (await request.get('/__test/counts')).json()).toEqual({sends:1,starts:1,decisions:1});
  await page.reload();await expect(page.getByText('Your message was sent. The outcome is saved in Memory.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Approve and send'})).toHaveCount(0);
});

test('rejection cancels without sending',async({page,request})=>{
  await prepare(page);await page.getByRole('button',{name:'Reject action'}).click();
  await expect(page.getByText('You rejected this action. No message was sent.')).toBeVisible();
  expect((await (await request.get('/__test/counts')).json()).sends).toBe(0);
});

test('pending approval survives a browser reload',async({page,request})=>{
  await prepare(page);expect(new URL(page.url()).searchParams.get('run')).toBeTruthy();
  await page.reload();await expect(page.getByRole('heading',{name:'Waiting for your decision'})).toBeVisible();
  await expect(page.getByText(message,{exact:true})).toBeVisible();
  expect((await (await request.get('/__test/counts')).json()).starts).toBe(1);
});

test('expired sessions block research and recover after sign-in',async({page,context})=>{
  await context.clearCookies();await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Your session has expired.');
  await expect(page.getByRole('button',{name:'Research and prepare'})).toHaveCount(0);
  await context.addCookies([{name:'test-session',value:'owner'.repeat(9),url:'http://127.0.0.1:4173'}]);
  await page.getByRole('button',{name:'Connect again'}).click();
  await expect(page.getByText('Workspace connected',{exact:true})).toBeVisible();
});

test('a lost approval response requires a status refresh without resending',async({page,request})=>{
  await prepare(page);
  await page.route('**/decision',async route=>{await route.fetch();await route.abort('failed');});
  await page.getByRole('button',{name:'Approve and send'}).click();
  await expect(page.getByRole('alert')).toContainText('connection was interrupted');
  await expect(page.getByRole('button',{name:'Approve and send'})).toBeDisabled();
  await page.getByRole('button',{name:'Refresh status'}).click();
  await expect(page.getByText('Your message was sent. The outcome is saved in Memory.')).toBeVisible();
  expect((await (await request.get('/__test/counts')).json()).sends).toBe(1);
});

test('duplicate approval clicks produce one delivery',async({page,request})=>{
  await prepare(page);
  await page.getByRole('button',{name:'Approve and send'}).evaluate((button:HTMLButtonElement)=>{button.click();button.click();});
  await expect(page.getByText('Your message was sent. The outcome is saved in Memory.')).toBeVisible();
  expect((await (await request.get('/__test/counts')).json()).decisions).toBe(1);
  expect((await (await request.get('/__test/counts')).json()).sends).toBe(1);
});

test('unavailable hosts fail visibly without a fabricated plan',async({page})=>{
  await page.route('**/api/v2/targets',route=>route.fulfill({status:503,contentType:'application/json',body:'{}'}));
  await page.goto('/');await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button',{name:'Research and prepare'})).toHaveCount(0);
});

test('review fits a narrow screen and keeps explicit action labels',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});await prepare(page);
  await expect(page.getByRole('button',{name:'Approve and send'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('mobile-review.png'),fullPage:true});
});

test('consent changes stop delivery and show the failed step',async({page,request})=>{
  await prepare(page);await request.post('/__test/revoke-consent');
  await page.getByRole('button',{name:'Approve and send'}).click();
  await expect(page.getByRole('heading',{name:'Stopped',exact:true})).toBeVisible();
  await expect(page.getByText('Opportunity or access changed; research and approval must be renewed')).toBeVisible();
  expect((await (await request.get('/__test/counts')).json()).sends).toBe(0);
});

test('a different actor cannot reopen the reviewed run',async({page,context})=>{
  await prepare(page);
  await context.addCookies([{name:'test-session',value:'other'.repeat(9),url:'http://127.0.0.1:4173'}]);
  await page.reload();await expect(page.getByRole('alert')).toContainText('belongs to another workspace');
  await expect(page.getByRole('button',{name:'Approve and send'})).toHaveCount(0);
});

test('forged CSRF tokens cannot authorize outreach',async({page,request})=>{
  await prepare(page);
  await page.route('**/decision',route=>route.continue({headers:{...route.request().headers(),'x-csrf-token':'forged'}}));
  await page.getByRole('button',{name:'Approve and send'}).click();
  await expect(page.getByRole('alert')).toContainText('did not authorize');
  expect((await (await request.get('/__test/counts')).json()).sends).toBe(0);
});
