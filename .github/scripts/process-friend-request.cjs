const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ============这里已经填好你的博客信息，不用改============
const SITE_INFO = {
  name: "hhwzk博客",
  url: "https://hhwzk.cc.cd/",
  avatar: "https://hhwzk.cc.cd/avatar.png",
  desc: "个人博客站点"
};
const CONFIG_PATH = "src/config/friendsConfig.ts";
// ======================================================

function normalizeUrl(u) {
  try {return new URL(u.trim()).href;}catch{return "";}
}
function trimSlash(u) {return u.replace(/\/+$/, "");}

function parseBody(body) {
  const getName = (key)=>{
    const reg = new RegExp(`### ${key}[\\s\\S]*?([^\\n]+)`);
    const m = body.match(reg);
    return m?.[1]?.trim()||"";
  };
  return {
    name: getName("你的网站名称"),
    url: normalizeUrl(getName("你的网站主页")),
    friendUrl: normalizeUrl(getName("你的友链页面地址")),
    desc: getName("站点简介"),
    avatar: normalizeUrl(getName("头像图片直链"))
  };
}

async function checkHasBackLink(pageUrl) {
  let browser;
  try {
    browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
    const page = await browser.newPage();
    let retry = 3;
    while(retry>0){
      try{
        await page.goto(pageUrl,{waitUntil:"domcontentloaded",timeout:15000});
        const html = await page.content();
        const links = await page.$$eval("a",a=>a.map(i=>i.href));
        const has = html.includes(SITE_INFO.url) || html.includes(SITE_INFO.name) || links.some(x=>x.includes(trimSlash(SITE_INFO.url)));
        return {ok:true,hasLink:has};
      }catch(e){
        retry--;
        if(retry===0) return {ok:false,err:e.message};
        await new Promise(r=>setTimeout(r,2000));
      }
    }
  }finally{if(browser) await browser.close();}
}

function readFriendList() {
  const raw = fs.readFileSync(CONFIG_PATH,"utf8");
  const arrStr = raw.match(/export const friendsConfig: FriendLink\[\] = (\[[\s\S]*?\]);/)?.[1];
  let list = [];
  try{list = eval(`(${arrStr})`);}catch{}
  return {raw,list};
}

function writeFriendList(list) {
  const template = `export interface FriendLink {
  title: string;
  imgurl: string;
  desc: string;
  siteurl: string;
  tags: string[];
  weight: number;
  enabled: boolean;
  issue_id: number;
}

export const friendsConfig: FriendLink[] = ${JSON.stringify(list,null,2)};
`;
  fs.writeFileSync(CONFIG_PATH,template,"utf8");
}

async function handler({github,context,core}){
  const {repo:{owner,repo},payload} = context;
  const issue = payload.issue;
  const num = issue.number;
  const body = issue.body||"";
  const comment = payload.comment;
  const author = issue.user.login;

  if(!body.includes("### 你的网站名称")) return;
  const info = parseBody(body);
  if(!info.name||!info.url||!info.friendUrl){
    await github.rest.issues.createComment({owner,repo,issue_number:num,body:"信息不全，请完整填写表单"});
    return;
  }

  if(comment && comment.user.login !== author) return;

  await github.rest.issues.addLabels({owner,repo,issue_number:num,labels:["验证中"]});
  const res = await checkHasBackLink(info.friendUrl);

  if(!res.ok){
    await github.rest.issues.createComment({owner,repo,issue_number:num,body:`页面访问失败：${res.err}`});
    await github.rest.issues.setLabels({owner,repo,issue_number:num,labels:["需修改"]});
    return;
  }

  if(!res.hasLink){
    await github.rest.issues.createComment({owner,repo,issue_number:num,body:"未检测到本站友链，请先添加后评论刷新"});
    await github.rest.issues.setLabels({owner,repo,issue_number:num,labels:["需修改"]});
    return;
  }

  let {list} = readFriendList();
  const exist = list.some(i=>trimSlash(i.siteurl)===trimSlash(info.url));
  if(exist){
    await github.rest.issues.createComment({owner,repo,issue_number:num,body:"该站点已存在友链"});
    await github.rest.issues.setLabels({owner,repo,issue_number:num,labels:["已存在"]});
    return;
  }

  list.push({
    title: info.name,
    imgurl: info.avatar||"",
    desc: info.desc||"暂无描述",
    siteurl: info.url,
    tags:["Blog"],
    weight:10,
    enabled:true,
    issue_id:num
  });
  writeFriendList(list);

  try{
    execSync(`git config user.name github-actions[bot] && git config user.email github-actions[bot]@users.noreply.github.com`);
    execSync(`git add ${CONFIG_PATH}`);
    execSync(`git commit -m "自动添加友链 ${info.name}"`);
    execSync(`git push`);
  }catch(e){
    core.info("提交推送可能触发格式化工作流");
  }

  await github.rest.issues.createComment({owner,repo,issue_number:num,body:`✅审核通过！已自动录入友链，稍后部署即可展示`});
  await github.rest.issues.setLabels({owner,repo,issue_number:num,labels:["已通过"]});
  await github.rest.issues.update({owner,repo,issue_number:num,state:"closed"});
}

module.exports = handler;