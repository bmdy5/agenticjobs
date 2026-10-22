import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

/** 校验真实 JUnit 结果，拒绝空结果、跳过和基础设施错误。 */
export function resultOf(xml){
 const cases=[...xml.matchAll(/<testcase\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/testcase>)/g)].map(m=>({name:(m[1].match(/\bname="([^"]*)"/)?.[1]||'').replaceAll('&amp;','&').replaceAll('&quot;','"'),body:m[2]||''}));
 if(!cases.length||cases.some(c=>/<skipped\b/.test(c.body)))throw Error('Empty or skipped test results');
 return {cases,failed:cases.some(c=>/<(?:failure|error)\b/.test(c.body))};
}
/** 将凭据放入 curl 标准输入，避免进入命令行和输出。 */
function request(url,token,payload,method){
 const config=[`url = ${JSON.stringify(url)}`,'silent','show-error','max-time = 45','header = "Content-Type: application/json"',...(token?[`header = ${JSON.stringify('Authorization: Bearer '+token)}`]:[]),...(method?[`request = ${method}`]:[]),...(payload?[`data = ${JSON.stringify(JSON.stringify(payload))}`]:[])].join('\n');
 const r=spawnSync('curl',['--config','-'],{input:config,encoding:'utf8'});if(r.status!==0)throw Error('Feishu transport failed');const data=JSON.parse(r.stdout);if(data.code!==0)throw Error('Feishu API failed: '+data.code);return data;
}
/** 失败时创建任务，全部通过后完成同一 GUID 的任务。 */
export function sync(mode,xmlPath,metaPath,outPath){
 const result=resultOf(fs.readFileSync(xmlPath,'utf8'));if(mode==='complete'&&result.failed)throw Error('Refusing completion: tests failed');if(mode==='fail'&&!result.failed)throw Error('No failing tests');
 const meta=JSON.parse(fs.readFileSync(metaPath));const api='https://open.feishu.cn/open-apis';
 const token=request(api+'/auth/v3/tenant_access_token/internal','',{app_id:process.env.FEISHU_TESTOMAT_APP_ID,app_secret:process.env.FEISHU_TESTOMAT_APP_SECRET}).tenant_access_token;
 let task;
 const description=`个人演示，非公司故障。${mode==='complete'?'自动复测通过，PR保持未合并。':'自动测试发现问题，等待AI修复。'}\nIssue：${meta.issueUrl}\n请求：${meta.requestUrl}\n${process.env.QA_PR_URL?'PR：'+process.env.QA_PR_URL+'\n':''}${process.env.GITHUB_RUN_URL?'复测：'+process.env.GITHUB_RUN_URL:''}`;
 if(mode==='fail'){
  if(meta.taskGuid)task=request(api+'/task/v2/tasks/'+meta.taskGuid,token).data.task;
  else task=request(api+'/task/v2/tasks',token,{summary:'【AI全流程试用】'+result.cases[0].name,description,members:[{id:'ou_72ba2d7d186f85e39786aaa95823d5a3',type:'user',role:'assignee'}],tasklists:[{tasklist_guid:'1254b46c-5edb-4dba-b770-ffea8fab33be'}]}).data.task;
  meta.taskGuid=task.guid;fs.writeFileSync(metaPath,JSON.stringify(meta,null,2));
 }else{
  if(!meta.taskGuid)throw Error('Missing task mapping');
  request(api+'/task/v2/tasks/'+meta.taskGuid,token,{task:{completed_at:String(Date.now()),description},update_fields:['completed_at','description']},'PATCH');
  task=request(api+'/task/v2/tasks/'+meta.taskGuid,token).data.task;if(task.status!=='done')throw Error('Task not completed');
 }
 const evidence={mode,guid:task.guid,status:task.status,url:task.url,issueUrl:meta.issueUrl};fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## 飞书自动同步\n\n${task.status}: [个人试用任务](${task.url})\n\nIssue: ${meta.issueUrl}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))sync(...process.argv.slice(2));
