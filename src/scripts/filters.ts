import { matches } from '../lib/filters';
const form = document.querySelector<HTMLFormElement>('[data-filters]');
if (form) {
 const items=Array.from(document.querySelectorAll<HTMLElement>('[data-item]'));
 const count=document.querySelector<HTMLElement>('[data-count]');
 const empty=document.querySelector<HTMLElement>('[data-empty]');
 const update=()=> { const values=new FormData(form); let total=0; items.forEach(item=>{const visible=matches({search:item.dataset.search ?? '',subject:item.dataset.subject ?? '',grades:(item.dataset.grades ?? '').split(',').map(Number)},String(values.get('query') ?? ''),String(values.get('subject') ?? ''),String(values.get('grade') ?? ''));item.hidden=!visible;if(visible)total++;});if(count)count.textContent=`Показано: ${total} из ${items.length}`;if(empty)empty.hidden=total!==0; };
 form.hidden=false; form.addEventListener('input',update); form.addEventListener('change',update); form.addEventListener('submit',event=>event.preventDefault()); form.addEventListener('reset',()=>setTimeout(update,0)); document.querySelector('[data-reset]')?.addEventListener('click',()=>{form.reset();form.querySelector('input')?.focus();});update();
}
