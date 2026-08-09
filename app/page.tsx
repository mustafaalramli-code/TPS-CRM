"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";

type Row = { id: string; name: string; account: string; owner: string; value: string; status: string; date: string; phone?:string; region?:string; location?:string };
type WonProject = { id: string; customerId:string; name: string; type: string; status: string; progress: string; start: string; due: string };
type CustomerOpportunity = { customerId:string; id:string; name:string; type:string; documentType?:string; value:string; stage:string; owner:string; close:string };
const supplierNames = ["Gulf Industrial Supplies", "Schneider Electric Arabia", "Emerson Process Management", "Siemens Energy", "Al-Fanar Electrical Systems"];
const clientContactDetails = [
  {client:"Acme Industries",name:"Olivia Martin",phone:"+966 55 204 1180",region:"Riyadh",location:"Riyadh"},
  {client:"Acme Industries",name:"Daniel Reed",phone:"+966 50 441 8270",region:"Eastern Province",location:"Dammam"},
  {client:"Acme Industries",name:"Maya Hassan",phone:"+966 54 118 3095",region:"Western Region",location:"Jeddah"},
  {client:"Northstar Labs",name:"James Wilson",phone:"+966 54 822 4012",region:"Riyadh",location:"Riyadh"},
  {client:"Mira Systems",name:"Emma Thompson",phone:"+966 50 314 8870",region:"Eastern Province",location:"Al Khobar"},
  {client:"Vertex Group",name:"Noah Anderson",phone:"+966 56 702 1994",region:"Western Region",location:"Jeddah"},
];

const navigation = [
  { icon:"OV", label:"Overview", color:"blue" }, { icon:"CU", label:"Customers", color:"purple" },
  { icon:"CO", label:"Contacts", color:"cyan" }, { icon:"OP", label:"Opportunities", color:"green" },
  { icon:"PR", label:"Projects", color:"pink" },
  { icon:"SU", label:"Suppliers", color:"teal" }, { icon:"AC", label:"Activities", color:"magenta" },
  { icon:"TS", label:"Tasks", color:"yellow" }, { icon:"EM", label:"Employees", color:"indigo" },
  { icon:"DI", label:"Directory", color:"cyan" }, { icon:"RP", label:"Reports", color:"red" },
];

const records: Record<string, Row[]> = {
  Customers: [
    { id:"CUS-1048", name:"Acme Industries", account:"Olivia Martin", owner:"Sarah Chen", value:"$128,400", status:"Active", date:"Aug 2, 2026" },
    { id:"CUS-1047", name:"Northstar Labs", account:"James Wilson", owner:"David Kim", value:"$92,750", status:"Active", date:"Jul 30, 2026" },
    { id:"CUS-1046", name:"Mira Systems", account:"Emma Thompson", owner:"Sarah Chen", value:"$71,200", status:"At risk", date:"Jul 28, 2026" },
    { id:"CUS-1045", name:"Vertex Group", account:"Noah Anderson", owner:"Alex Morgan", value:"$54,800", status:"Active", date:"Jul 25, 2026" },
  ],
  Opportunities: [
    { id:"OPP-284", name:"Northstar expansion", account:"Northstar Labs", owner:"Sarah Chen", value:"$184,000", status:"Proposal", date:"Sep 15, 2026" },
    { id:"OPP-283", name:"Cloud migration", account:"Acme Industries", owner:"David Kim", value:"$126,500", status:"Negotiation", date:"Aug 28, 2026" },
    { id:"OPP-282", name:"Analytics platform", account:"Vertex Group", owner:"Alex Morgan", value:"$98,000", status:"Qualified", date:"Oct 4, 2026" },
    { id:"OPP-281", name:"Annual renewal", account:"Mira Systems", owner:"Sarah Chen", value:"$64,200", status:"At risk", date:"Aug 18, 2026" },
  ],
  Quotations: [
    { id:"QUO-631", name:"Northstar phase II", account:"Northstar Labs", owner:"Sarah Chen", value:"$184,000", status:"Draft", date:"Aug 1, 2026" },
  ],
  Projects: [
    { id:"PRJ-119", name:"Q3 platform rollout", account:"Acme Industries", owner:"David Kim", value:"72%", status:"In progress", date:"Sep 12, 2026" },
    { id:"PRJ-118", name:"Data consolidation", account:"Northstar Labs", owner:"Sarah Chen", value:"45%", status:"In progress", date:"Oct 2, 2026" },
    { id:"PRJ-117", name:"Customer portal", account:"Vertex Group", owner:"Alex Morgan", value:"91%", status:"Review", date:"Aug 16, 2026" },
    { id:"PRJ-116", name:"CRM onboarding", account:"Mira Systems", owner:"Sarah Chen", value:"100%", status:"Completed", date:"Jul 29, 2026" },
  ],
  Contacts: [
    { id:"CON-986", name:"Olivia Martin", account:"Acme Industries", owner:"Sales", value:"General Manager", status:"Primary", date:"Aug 2, 2026", phone:"+966 55 204 1180", region:"Riyadh", location:"Riyadh" },
    { id:"CON-985", name:"James Wilson", account:"Northstar Labs", owner:"Projects", value:"Project Director", status:"Active", date:"Jul 30, 2026", phone:"+966 54 822 4012", region:"Riyadh", location:"Riyadh" },
    { id:"CON-984", name:"Emma Thompson", account:"Mira Systems", owner:"Procurement", value:"Procurement Lead", status:"Active", date:"Jul 28, 2026", phone:"+966 50 314 8870", region:"Eastern Province", location:"Al Khobar" },
    { id:"CON-983", name:"Noah Anderson", account:"Vertex Group", owner:"Engineering", value:"Technical Manager", status:"Primary", date:"Jul 25, 2026", phone:"+966 56 702 1994", region:"Western Region", location:"Jeddah" },
  ],
  Suppliers: [
    { id:"SUP-073", name:"Apex Equipment", account:"Industrial systems", owner:"Sarah Chen", value:"SAR 820k", status:"Approved", date:"Aug 1, 2026" },
    { id:"SUP-072", name:"Gulf Controls", account:"Instrumentation", owner:"David Kim", value:"SAR 465k", status:"Approved", date:"Jul 27, 2026" },
    { id:"SUP-071", name:"FlowTech GmbH", account:"Pumps and valves", owner:"Alex Morgan", value:"EUR 92k", status:"Review", date:"Jul 22, 2026" },
    { id:"SUP-070", name:"Prime Automation", account:"Control panels", owner:"Sarah Chen", value:"SAR 310k", status:"Active", date:"Jul 18, 2026" },
  ],
  Activities: [
    { id:"ACT-001", name:"Customer follow-up", account:"Acme Industries", owner:"Sarah Chen", value:"Phone call", status:"Completed", date:"Aug 4, 2026" },
    { id:"ACT-002", name:"Technical clarification", account:"Northstar Labs", owner:"David Kim", value:"Meeting", status:"Scheduled", date:"Aug 6, 2026" },
    { id:"ACT-003", name:"Supplier offer review", account:"FlowTech GmbH", owner:"Alex Morgan", value:"Review", status:"In progress", date:"Aug 7, 2026" },
  ],
  Tasks: [
    { id:"TSK-041", name:"Submit revised offer", account:"Northstar Labs", owner:"Sarah Chen", value:"High", status:"In progress", date:"Aug 6, 2026" },
    { id:"TSK-040", name:"Confirm delivery terms", account:"Apex Equipment", owner:"David Kim", value:"Medium", status:"Open", date:"Aug 8, 2026" },
    { id:"TSK-039", name:"Upload CR documents", account:"Acme Industries", owner:"Alex Morgan", value:"Low", status:"Completed", date:"Aug 3, 2026" },
  ],
  Employees: [
    { id:"EMP-001", name:"Alex Morgan", account:"Westfield & Co.", owner:"Sales", value:"Administrator", status:"Active", date:"Aug 4, 2026" },
    { id:"EMP-002", name:"Sarah Chen", account:"Westfield & Co.", owner:"Business development", value:"Sales manager", status:"Active", date:"Aug 4, 2026" },
    { id:"EMP-003", name:"David Kim", account:"Westfield & Co.", owner:"Projects", value:"Project manager", status:"Active", date:"Aug 3, 2026" },
  ],
};

const sourceCounts: Record<string, number> = { Customers:338, Contacts:986, Opportunities:171, Projects:66, Suppliers:73, Activities:1, Tasks:0, Employees:1 };

const pageCopy: Record<string, [string, string]> = {
  Customers:["Maintain Clients", "Manage clients, contacts, and client health."],
  Opportunities:["Opportunities", "Track opportunities through the commercial pipeline."],
  Projects:["Projects", "Keep delivery milestones, owners, and progress on track."],
  Contacts:["Contacts", "Manage the 986 people linked to client accounts."],
  Suppliers:["Suppliers", "Manage supplier records, scopes, offers, and opportunity links."],
  Activities:["Activities", "Record calls, meetings, notes, and account attachments."],
  Tasks:["Tasks", "Assign priorities, due dates, completion, and attachments."],
  Employees:["Employees", "Manage internal users, roles, contact details, and assignments."],
  Directory:["Business directory", "Browse regions, branches, end users, categories, and lookup data."],
  Reports:["Reports", "Explore performance across sales and delivery."],
};

function selectValues(field: string, module = "") {
  if (field === "Document Type") return ["Case", "Case Solved", "Delivered", "Inquiry", "Letter", "Offer", "Order", "Task", "Secured"];
  if (field === "How Found Type") return ["Current Client", "Referral", "Website", "Tender Portal", "Consultant", "Other"];
  if (field === "Task Type") return ["Inquiry", "Offer", "Case", "Others"];
  if (field === "Opportunity Type") return ["Canal Water", "Grey Water", "Sanitary Waste Water Plant", "Desilination Plant", "DAMS & RAINWATER PLANTS", "Others"];
  if (field === "Account Type") return module === "Suppliers" ? ["Supplier"] : ["Client"];
  if (field.includes("Currency")) return ["SAR", "USD", "EUR", "GBP"];
  if (field.includes("Category")) return module === "Suppliers" ? ["Industrial equipment", "Electrical systems", "Process automation", "Services"] : ["Client"];
  if (field.includes("Project Status")) return ["New", "In progress", "On hold", "Completed", "Cancelled"];
  if (field.includes("Status")) return ["Active", "Pending", "Completed", "At risk", "Closed"];
  if (field.includes("Type")) return ["New", "Existing", "Renewal", "Service"];
  return ["Active", "Pending", "Completed"];
}

function customerFieldValue(field: string, customer: Row | null, module = "") {
  const isEmployeeField = field.includes("Handled") || field.includes("Assigned To") || field === "Employee" || field.includes("Responsible");
  if (isEmployeeField) return customer?.owner || "Alex Morgan";
  if (field === "Account Type" || field === "Client Type") return module === "Suppliers" ? "Supplier" : "Client";
  if (!customer) return "";
  if (module === "Employees") {
    const employeeValues: Record<string,string> = {"Employee ID":customer.id,"First Name":customer.name.split(" ")[0],"Last Name":customer.name.split(" ").slice(1).join(" "),"Company":customer.account,"Job Title":customer.value,"Department":customer.owner,"E-mail Address":`${customer.name.toLowerCase().replace(/ /g,".")}@tps.example`,"Country / Region":"Saudi Arabia"};
    return employeeValues[field] || "";
  }
  if (module === "Tasks") {
    const taskValues:Record<string,string>={"Project Name":customer.name,"Task Type":"Others","Client":customer.account,"Employee":customer.owner,"Project Status":customer.status,"Next Call":customer.date,"Offer Value":customer.value};
    return taskValues[field] || "";
  }
  if (module === "Contacts") {
    const contactValues:Record<string,string>={"ContactID":customer.id,"First Name":customer.name.split(" ")[0],"Last Name":customer.name.split(" ").slice(1).join(" "),"Full Name":customer.name,"Company":customer.account,"Job Title":customer.value,"Department":customer.owner,"E-mail Address":`${customer.name.toLowerCase().replace(/ /g,".")}@client.example`};
    return contactValues[field] || "";
  }
  if (module === "Activities") {
    const activityValues:Record<string,string>={"ActivityID":customer.id,"Company":customer.account,"Activity Type":customer.value,"Activity Date":customer.date,"Description":customer.name,"Notes":customer.status};
    return activityValues[field] || "";
  }
  if (module === "Opportunities" || module === "Quotations") {
    const commercialValues:Record<string,string>={"Project Name":customer.name,"Employee":customer.owner,"End User":customer.account,"Offer Value":customer.value,"Project Status":customer.status,"Offer Date":customer.date};
    return commercialValues[field] || "";
  }
  const values: Record<string,string> = { "AccountID":customer.id, "Account Name":customer.name, "Client Name":customer.name, "Handled by":customer.owner, "Account Type":"Client", "Client Type":"Client", "Category":"Client", "Call Status":customer.status, "Notes":`Account value ${customer.value}` };
  return values[field] || "";
}

function VoiceTextarea({defaultValue="",onValueChange}:{defaultValue?:string,onValueChange?:(value:string)=>void}) {
  const [value,setValue]=useState(defaultValue); const [listening,setListening]=useState(false); const [message,setMessage]=useState(""); const recognition=useRef<any>(null);
  function toggleVoice(){
    if(listening){recognition.current?.stop();setListening(false);return;}
    const SpeechRecognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SpeechRecognition){setMessage("Voice typing is not supported in this browser.");return;}
    const instance=new SpeechRecognition(); recognition.current=instance; instance.lang="en-US"; instance.continuous=true; instance.interimResults=false;
    instance.onresult=(event:any)=>{let speech="";for(let i=event.resultIndex;i<event.results.length;i++)speech+=event.results[i][0].transcript;setValue(current=>{const next=`${current}${current?" ":""}${speech}`;onValueChange?.(next);return next})};
    instance.onerror=()=>{setMessage("Microphone access was not available.");setListening(false)}; instance.onend=()=>setListening(false); instance.start(); setMessage(""); setListening(true);
  }
  return <div className="voice-field"><textarea value={value} onChange={e=>{setValue(e.target.value);onValueChange?.(e.target.value)}} placeholder="Type or use the microphone..."/><button type="button" className={listening?"listening":""} onClick={toggleVoice} aria-label={listening?"Stop voice typing":"Start voice typing"}><span>MIC</span>{listening?" Stop listening":" Dictate"}</button>{message&&<small>{message}</small>}</div>;
}

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [notice, setNotice] = useState("");
  const [directoryTarget,setDirectoryTarget]=useState("Regions");
  const [drawer, setDrawer] = useState(false);
  const [customerPage, setCustomerPage] = useState("General");
  const [opportunitySection,setOpportunitySection]=useState("Ownership & status");
  const [clientOrderEnabled,setClientOrderEnabled]=useState(false);
  useEffect(()=>{if(active==="Opportunities"&&opportunitySection==="Client")setOpportunitySection("Ownership & status")},[active,opportunitySection]);
  useEffect(()=>{if(!drawer)setClientOrderEnabled(false)},[drawer]);
  const [contactRows, setContactRows] = useState([1]);
  const [editingCustomer, setEditingCustomer] = useState<Row | null>(null);
  const [wonProjects, setWonProjects] = useState<WonProject[]>([]);
  const [employeeRows, setEmployeeRows] = useState<Row[]>(records.Employees);
  const [contactListRows, setContactListRows] = useState<Row[]>(records.Contacts);
  const [customerRows, setCustomerRows] = useState<Row[]>(records.Customers);
  const [taskRows, setTaskRows] = useState<Row[]>(records.Tasks);
  const [opportunityRows, setOpportunityRows] = useState<Row[]>(records.Opportunities);
  const [customerOpportunityRows,setCustomerOpportunityRows]=useState<CustomerOpportunity[]>([
    {customerId:"CUS-1048",id:"OPP-284",name:"Cloud migration",type:"New",value:"$126,500",stage:"Negotiation",owner:"David Kim",close:"2026-08-28"},
    {customerId:"CUS-1048",id:"OPP-271",name:"Annual support renewal",type:"Re-bidding",value:"$42,000",stage:"Proposal",owner:"Sarah Chen",close:"2026-09-12"},
    {customerId:"CUS-1047",id:"OPP-259",name:"Equipment upgrade",type:"New",value:"$88,750",stage:"Qualified",owner:"Alex Morgan",close:"2026-10-04"},
  ]);
  const [quotationRows, setQuotationRows] = useState<Row[]>(records.Quotations);
  function navigate(label: string) { setActive(label); setQuery(""); setFilter("All statuses"); setDrawer(false); }
  function announce(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 2200); }
  function saveDrawer(e: any) {
    e.preventDefault();
    if (active === "Customers") {
      if(customerPage!=="General"){setDrawer(false);announce("Client changes saved");return;}
      const form=e.currentTarget as HTMLFormElement;
      const control=(label:string)=>{const fieldLabel=Array.from(form.querySelectorAll("label")).find(item=>item.childNodes[0]?.textContent?.trim()===label);return (fieldLabel?.querySelector("input,select,textarea") as HTMLInputElement | null)?.value.trim()||"";};
      const customerName=control("Client Name");
      if(!customerName){announce("Client Name is required");return;}
      const customer:Row={id:control("AccountID")||`CUS-${String(1049+customerRows.length).padStart(4,"0")}`,name:customerName,account:control("Phone")||"No primary contact",owner:control("Handled by")||"Alex Morgan",value:editingCustomer?.value||"$0",status:control("Call Status")||"Active",date:new Date().toLocaleDateString()};
      setCustomerRows(rows=>editingCustomer?rows.map(row=>row.id===editingCustomer.id?customer:row):[customer,...rows]);
      setDrawer(false);setEditingCustomer(null);announce(editingCustomer?"Client information saved":"New client added to the client list");return;
    }
    if (active === "Employees") {
      const form = e.currentTarget as HTMLFormElement;
      const field = (label:string) => (form.querySelector(`input[placeholder="${label}"]`) as HTMLInputElement | null)?.value.trim() || "";
      const firstName=field("First Name"), lastName=field("Last Name");
      if (!firstName || !lastName) { announce("First name and last name are required"); return; }
      const employee:Row={id:field("Employee ID")||`EMP-${String(employeeRows.length+1).padStart(3,"0")}`,name:`${firstName} ${lastName}`,account:field("Company")||"TPS",owner:"Staff",value:field("Job Title")||"Employee",status:"Active",date:new Date().toLocaleDateString()};
      setEmployeeRows(rows=>editingCustomer?rows.map(row=>row.id===editingCustomer.id?employee:row):[...rows,employee]);
      setDrawer(false);setEditingCustomer(null);announce(editingCustomer?"Employee information updated":"New employee added to the employee list");return;
    }
    if (active === "Tasks") {
      const form=e.currentTarget as HTMLFormElement;
      const control=(label:string)=>{const fieldLabel=Array.from(form.querySelectorAll("label")).find(item=>item.childNodes[0]?.textContent?.trim()===label);return (fieldLabel?.querySelector("input,select,textarea") as HTMLInputElement | null)?.value.trim()||"";};
      const taskName=control("Project Name"), taskType=control("Task Type")||"Others";
      if(!taskName){announce("Project Name is required");return;}
      const task:Row={id:editingCustomer?.id||`TSK-${String(42+taskRows.length).padStart(3,"0")}`,name:taskName,account:control("Client")||"Unassigned client",owner:control("Employee")||"Alex Morgan",value:control("Priority")||"Medium",status:control("Project Status")||"Open",date:control("Next Call")||new Date().toLocaleDateString()};
      setTaskRows(rows=>editingCustomer?rows.map(row=>row.id===editingCustomer.id?task:row):[task,...rows]);
      if(taskType==="Offer"){
        const opportunity:Row={...task,id:`OPP-${String(285+opportunityRows.length).padStart(3,"0")}`,status:"Qualified",value:control("Offer Value")||"To be valued"};
        setOpportunityRows(rows=>rows.some(row=>row.name===opportunity.name)?rows:[opportunity,...rows]);
      }
      setDrawer(false);setEditingCustomer(null);announce(taskType==="Offer"?"Offer task saved and transferred to Opportunities":editingCustomer?"Task information updated":"New task added to the task list");return;
    }
    if (active === "Opportunities" || active === "Quotations") {
      const form=e.currentTarget as HTMLFormElement;
      const control=(label:string)=>{const fieldLabel=Array.from(form.querySelectorAll("label")).find(item=>item.childNodes[0]?.textContent?.trim()===label);return (fieldLabel?.querySelector("input,select,textarea") as HTMLInputElement | null)?.value.trim()||"";};
      const recordName=control("Project Name");
      if(!recordName){announce("Project Name is required");return;}
      const targetRows=active==="Quotations"?quotationRows:opportunityRows;
      const commercial:Row={id:editingCustomer?.id||`${active==="Quotations"?"QUO":"OPP"}-${String(286+targetRows.length).padStart(3,"0")}`,name:recordName,account:control("Client")||control("End User")||"Unassigned client",owner:control("Employee")||"Alex Morgan",value:control("Offer Value")||"To be valued",status:control("Project Status")||"Qualified",date:control("Offer Date")||new Date().toLocaleDateString()};
      const update=(rows:Row[])=>editingCustomer?rows.map(row=>row.id===editingCustomer.id?commercial:row):[commercial,...rows];
      active==="Quotations"?setQuotationRows(update):setOpportunityRows(update);
      setDrawer(false);setEditingCustomer(null);announce(editingCustomer?"Commercial record updated":"New commercial record added");return;
    }
    setDrawer(false);announce(`${editingCustomer?`${actionName} changes`:`New ${actionName}`} saved`);
  }
  const actionName = ({Customers:"client",Contacts:"contact",Opportunities:"opportunity",Quotations:"quotation",Projects:"project",Suppliers:"supplier",Activities:"activity",Tasks:"task",Employees:"employee"} as Record<string,string>)[active] || "record";
  const accessFormName = ({Customers:"Client List",Contacts:"Contact Details",Opportunities:"Maintain Offers",Quotations:"Maintain Offers",Projects:"Project Status",Suppliers:"Supplier List",Activities:"Activity Details",Tasks:"Daily Tasks",Employees:"Employee Details"} as Record<string,string>)[active];
  const activeForm = accessPages.find(page => page.name === accessFormName);
  const drawerGroups: any = active === "Customers" && customerPage === "Opportunities" ? {map:()=><CustomerQuotationList customer={editingCustomer} contacts={contactListRows} announce={announce} employees={employeeRows} items={opportunityRows} setItems={setOpportunityRows} onWon={project=>setWonProjects(rows=>rows.some(row=>row.id===project.id)?rows:[project,...rows])}/>} : active === "Customers" && customerPage === "Suppliers" ? {map:()=><CustomerSuppliers announce={announce}/>} : active === "Customers" && customerPage === "Projects" ? {map:()=><CustomerProjects customer={editingCustomer} announce={announce} wonProjects={wonProjects}/>} : active === "Customers" && customerPage === "Activities" ? {map:()=><CustomerActivities announce={announce}/>} : active === "Customers" && customerPage === "Delivery" ? {map:()=><CustomerDeliveries announce={announce}/>} : active === "Customers" && customerPage === "Tasks" ? {map:()=><CustomerTasks announce={announce}/>} : active === "Customers" ? customerPages.find(page => page.name === customerPage)?.groups : activeForm?.groups;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "customer") {
      setActive("Customers");
      setEditingCustomer(records.Customers[0]);
      setCustomerPage(new URLSearchParams(window.location.search).get("customerTab")==="quotation"?"Opportunities":"General");
      setDrawer(true);
    }
  }, []);

  useEffect(() => {
    if (editingCustomer) setContactRows([Number(editingCustomer.id.replace(/\D/g,""))]);
  }, [editingCustomer]);

  useEffect(() => {
    if (!drawer) return;
    const form=document.querySelector(".access-drawer form") as HTMLFormElement|null;
    if(!form) return;
    const employeeLabel=Array.from(form.querySelectorAll("label")).find(label=>label.childNodes[0]?.textContent?.trim()==="Employee");const employeeSelect=employeeLabel?.querySelector("select");if(employeeSelect&&!employeeSelect.querySelector('option[value="__manage_employees"]')){const option=document.createElement("option");option.value="__manage_employees";option.textContent="Add / modify employees...";employeeSelect.appendChild(option)}
    const documentTypeLabel=Array.from(form.querySelectorAll("label")).find(label=>label.childNodes[0]?.textContent?.trim()==="Document Type");const documentTypeSelect=documentTypeLabel?.querySelector("select");if(documentTypeSelect&&!documentTypeSelect.querySelector('option[value="__manage_document_types"]')){const option=document.createElement("option");option.value="__manage_document_types";option.textContent="Add / modify document types...";documentTypeSelect.appendChild(option)}
    const opportunityTypeLabel=Array.from(form.querySelectorAll("label")).find(label=>label.childNodes[0]?.textContent?.trim()==="Opportunity Type");const opportunityTypeSelect=opportunityTypeLabel?.querySelector("select");if(opportunityTypeSelect&&!opportunityTypeSelect.querySelector('option[value="__manage_opportunity_types"]')){const option=document.createElement("option");option.value="__manage_opportunity_types";option.textContent="Add / modify opportunity types...";opportunityTypeSelect.appendChild(option)}
    const projectStatusLabel=Array.from(form.querySelectorAll("label")).find(label=>label.childNodes[0]?.textContent?.trim()==="Client Project Status");const projectStatusSelect=projectStatusLabel?.querySelector("select");if(projectStatusSelect&&!projectStatusSelect.querySelector('option[value="__manage_project_statuses"]')){const option=document.createElement("option");option.value="__manage_project_statuses";option.textContent="Add / modify project statuses...";projectStatusSelect.appendChild(option)}
    const currencySelects=Array.from(form.querySelectorAll("label")).filter(label=>label.childNodes[0]?.textContent?.trim()==="Currency").map(label=>label.querySelector("select")).filter((select):select is HTMLSelectElement=>Boolean(select));currencySelects.forEach(select=>{if(!select.querySelector('option[value="__manage_currencies"]')){const option=document.createElement("option");option.value="__manage_currencies";option.textContent="Add / modify currencies...";select.appendChild(option)}});
    const labels=Array.from(form.querySelectorAll("label"));
    const clientSelect=labels.find(label=>label.childNodes[0]?.textContent?.trim()==="Client")?.querySelector("select") as HTMLSelectElement|null;
    const contactLabel=labels.find(label=>label.childNodes[0]?.textContent?.trim()==="Contact Person");
    const contactInput=contactLabel?.querySelector("input") as HTMLInputElement|null;
    const contactSelect=contactInput?document.createElement("select"):null;
    const endUserLabel=labels.find(label=>label.childNodes[0]?.textContent?.trim()==="End User");
    const endUserInput=endUserLabel?.querySelector("input") as HTMLInputElement|null;
    const endUserSelect=endUserInput?document.createElement("select"):null;
    const supplierLabel=labels.find(label=>label.childNodes[0]?.textContent?.trim()==="Principle / Supplier Name");
    const supplierInput=supplierLabel?.querySelector("input") as HTMLInputElement|null;
    const supplierSelect=supplierInput?document.createElement("select"):null;
    const equipmentLabel=labels.find(label=>label.childNodes[0]?.textContent?.trim()==="Equipment");
    const equipmentInput=equipmentLabel?.querySelector("input") as HTMLInputElement|null;
    const equipmentSelect=equipmentInput?document.createElement("select"):null;
    const materialLabel=labels.find(label=>label.childNodes[0]?.textContent?.trim()==="Supplier Scope");
    const materialInput=materialLabel?.querySelector("textarea") as HTMLTextAreaElement|null;
    const materialSelect=materialInput?document.createElement("select"):null;
    const relatedInput=(name:string)=>labels.find(label=>label.childNodes[0]?.textContent?.trim()===name)?.querySelector("input") as HTMLInputElement|null;
    const telephoneInput=relatedInput("Telephone"),regionInput=relatedInput("Region"),locationInput=relatedInput("Location");
    const clearContactDetails=()=>{if(telephoneInput)telephoneInput.value="";if(regionInput)regionInput.value="";if(locationInput)locationInput.value=""};
    const refreshContacts=()=>{if(!contactSelect)return;const clientName=clientSelect?.value||editingCustomer?.account||"";contactSelect.replaceChildren(new Option("Select contact person...",""),...clientContactDetails.filter(contact=>contact.client===clientName).map(contact=>new Option(contact.name,contact.name)),new Option("Add / modify contacts...","__manage_contacts"));contactInput!.value="";clearContactDetails()};
    if(contactInput&&contactSelect){contactInput.hidden=true;contactSelect.setAttribute("aria-label","Contact Person");contactInput.insertAdjacentElement("afterend",contactSelect);refreshContacts()}
    if(endUserInput&&endUserSelect){endUserInput.hidden=true;endUserSelect.setAttribute("aria-label","End User");endUserSelect.replaceChildren(new Option("Select end user...",""),...['Private','NWC','Saudi Water Authority','Saudi Aramco','Saudi Electricity Company'].map(value=>new Option(value,value)),new Option("Add / modify end users...","__manage_end_users"));endUserSelect.value=endUserInput.value;endUserInput.insertAdjacentElement("afterend",endUserSelect)}
    if(supplierInput&&supplierSelect){supplierInput.hidden=true;supplierSelect.setAttribute("aria-label","Principle / Supplier Name");supplierSelect.replaceChildren(new Option("Select supplier...",""),...records.Suppliers.map(supplier=>new Option(supplier.name,supplier.name)),new Option("Add / modify suppliers...","__manage_suppliers"));supplierSelect.value=supplierInput.value;supplierInput.insertAdjacentElement("afterend",supplierSelect)}
    if(equipmentInput&&equipmentSelect){equipmentInput.hidden=true;equipmentSelect.setAttribute("aria-label","Equipment");equipmentSelect.replaceChildren(new Option("Select equipment...",""),...['Pumps','Valves','Control Panels','Instrumentation','Water Treatment Package','Electrical Equipment'].map(value=>new Option(value,value)),new Option("Add / modify equipment...","__manage_equipment"));equipmentSelect.value=equipmentInput.value;equipmentInput.insertAdjacentElement("afterend",equipmentSelect)}
    if(materialInput&&materialSelect){materialInput.hidden=true;materialSelect.multiple=true;materialSelect.size=7;materialSelect.className="supplier-material-list";materialSelect.setAttribute("aria-label","Supplier Materials");materialSelect.replaceChildren(...['Pumps','Valves','Control Panels','Instrumentation','Water Treatment Packages','Electrical Equipment'].map(value=>new Option(value,value)),new Option("Add / modify materials...","__manage_materials"));materialInput.insertAdjacentElement("afterend",materialSelect)}
    const handleFormChange=(event:Event)=>{const control=event.target as HTMLInputElement|HTMLSelectElement;if(control===clientSelect){refreshContacts();return;}if(control===contactSelect){if(control.value==="__manage_contacts"){const client=customerRows.find(item=>item.name===clientSelect?.value);if(client){setActive("Customers");setEditingCustomer(client);setCustomerPage("Contacts");setDrawer(true)}else announce("Choose a client before adding or modifying contacts");return;}if(contactInput)contactInput.value=control.value;const contact=clientContactDetails.find(item=>item.client===clientSelect?.value&&item.name===control.value);if(telephoneInput)telephoneInput.value=contact?.phone||"";if(regionInput)regionInput.value=contact?.region||"";if(locationInput)locationInput.value=contact?.location||"";return;}if(control instanceof HTMLSelectElement&&control.value==="__manage_clients"){setDrawer(false);setEditingCustomer(null);setActive("Customers");setQuery("");setFilter("All statuses");return;}if(control instanceof HTMLSelectElement&&control.value==="__manage_employees"){setDrawer(false);setEditingCustomer(null);setActive("Employees");setQuery("");setFilter("All statuses");return;}if(control instanceof HTMLSelectElement&&(control.value==="__manage_document_types"||control.value==="__manage_opportunity_types")){setDrawer(false);setEditingCustomer(null);setActive("Directory");setQuery("");setFilter("All statuses");return;}if(!(control instanceof HTMLInputElement)||control.type!=="date"||control.closest("label")?.childNodes[0]?.textContent?.trim()!=="Last Call Date"||!control.value)return;const nextDate=new Date(`${control.value}T00:00:00`);nextDate.setDate(nextDate.getDate()+7);const nextLabel=Array.from(form.querySelectorAll("label")).find(label=>label.childNodes[0]?.textContent?.trim()==="Next Call Date");const nextInput=nextLabel?.querySelector('input[type="date"]') as HTMLInputElement|null;if(nextInput)nextInput.value=nextDate.toISOString().slice(0,10)};
    const handleEndUserChange=()=>{if(!endUserSelect)return;if(endUserSelect.value==="__manage_end_users"){setDrawer(false);setEditingCustomer(null);setActive("Directory");setQuery("");setFilter("All statuses");return;}if(endUserInput)endUserInput.value=endUserSelect.value};
    const handleProjectStatusChange=()=>{if(projectStatusSelect?.value!=="__manage_project_statuses")return;setDrawer(false);setEditingCustomer(null);setActive("Directory");setQuery("");setFilter("All statuses")};
    const handleSupplierChange=()=>{if(!supplierSelect)return;if(supplierSelect.value==="__manage_suppliers"){setDrawer(false);setEditingCustomer(null);setActive("Suppliers");setQuery("");setFilter("All statuses");return;}if(supplierInput)supplierInput.value=supplierSelect.value};
    const handleEquipmentChange=()=>{if(!equipmentSelect)return;if(equipmentSelect.value==="__manage_equipment"){setDirectoryTarget("Equipment");setDrawer(false);setEditingCustomer(null);setActive("Directory");setQuery("");setFilter("All statuses");return;}if(equipmentInput)equipmentInput.value=equipmentSelect.value};
    const handleCurrencyChange=(event:Event)=>{const select=event.target as HTMLSelectElement;if(select.value!=="__manage_currencies")return;setDrawer(false);setEditingCustomer(null);setActive("Directory");setQuery("");setFilter("All statuses")};
    const handleMaterialChange=()=>{if(!materialSelect)return;if(Array.from(materialSelect.selectedOptions).some(option=>option.value==="__manage_materials")){setDirectoryTarget("Equipment");setDrawer(false);setEditingCustomer(null);setActive("Directory");setQuery("");setFilter("All statuses");return;}if(materialInput)materialInput.value=Array.from(materialSelect.selectedOptions).map(option=>option.value).join(", ")};
    form.addEventListener("change",handleFormChange);
    endUserSelect?.addEventListener("change",handleEndUserChange);
    projectStatusSelect?.addEventListener("change",handleProjectStatusChange);
    supplierSelect?.addEventListener("change",handleSupplierChange);
    equipmentSelect?.addEventListener("change",handleEquipmentChange);
    currencySelects.forEach(select=>select.addEventListener("change",handleCurrencyChange));
    materialSelect?.addEventListener("change",handleMaterialChange);
    return()=>{form.removeEventListener("change",handleFormChange);endUserSelect?.removeEventListener("change",handleEndUserChange);projectStatusSelect?.removeEventListener("change",handleProjectStatusChange);supplierSelect?.removeEventListener("change",handleSupplierChange);equipmentSelect?.removeEventListener("change",handleEquipmentChange);currencySelects.forEach(select=>select.removeEventListener("change",handleCurrencyChange));materialSelect?.removeEventListener("change",handleMaterialChange);contactSelect?.remove();endUserSelect?.remove();supplierSelect?.remove();equipmentSelect?.remove();materialSelect?.remove();if(contactInput)contactInput.hidden=false;if(endUserInput)endUserInput.hidden=false;if(supplierInput)supplierInput.hidden=false;if(equipmentInput)equipmentInput.hidden=false;if(materialInput)materialInput.hidden=false};
  },[drawer,active,customerRows]);

  return <main className="app-shell">
    <header className="topbar">
      <button className="product-switcher" aria-label="Open product switcher" onClick={()=>announce("Product switcher opened")}>+</button>
      <button className="brand" onClick={() => navigate("Overview")}><strong>TPS</strong><span>ClientCore</span></button>
      <div className="top-spacer" />
      <label className="search"><span aria-hidden="true">S</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${active.toLowerCase()}...`} aria-label={`Search ${active}`} /></label>
      <button className="icon-btn" aria-label="Help" onClick={()=>announce("Help center opened")}>?</button><button className="icon-btn notification" aria-label="Notifications" onClick={()=>announce("No new notifications")}>N<i /></button>
    </header>

    <aside className="sidebar"><nav aria-label="Primary navigation"><p className="eyebrow">Workspace</p>
      {navigation.map(item => <button key={item.label} className={active===item.label?"active":""} onClick={() => navigate(item.label)}><span className={`nav-icon ${item.color}`}>{item.icon}</span>{item.label==="Customers"?"Clients":item.label}</button>)}
      <p className="eyebrow lower">Manage</p><button className={active==="Employees"?"active":""} onClick={() => navigate("Employees")}><span>TM</span>Team & access</button><button className={active==="Directory"&&directoryTarget==="System settings"?"active":""} onClick={() => {setDirectoryTarget("System settings");navigate("Directory")}}><span>ST</span>Settings</button>
    </nav><div className="org-card"><span className="org-mark">W</span><div><strong>Westfield & Co.</strong><small>Enterprise plan</small></div><span>^</span></div></aside>

    <section className="workspace">
      <div className="page-heading"><div><p className="breadcrumb">ClientCore / {active==="Customers"?"Clients":active}</p><h1>{active==="Overview"?"Good morning, Alex":pageCopy[active]?.[0]}</h1><p>{active==="Overview"?"Here is what is happening across your business today.":pageCopy[active]?.[1]}</p></div>
        <div className="page-heading-actions"><img src="/tps-logo.png" alt="Technology Products and Services Co." />{!['Reports','Directory'].includes(active) && <button className="primary" onClick={() => { setEditingCustomer(null); setCustomerPage("General"); setOpportunitySection("Ownership & status"); setContactRows([1]); setDrawer(true); }}><span>+</span>Add {actionName}</button>}{active === "Reports" && <button className="primary" onClick={() => announce("Report exported as CSV")}><span>D</span>Export report</button>}</div>
      </div>

      {active === "Overview" && <Overview navigate={navigate} announce={announce} />}
      {["Customers","Contacts","Opportunities","Projects","Suppliers","Activities","Tasks","Employees"].includes(active) && <RecordsPage module={active} rowsOverride={active==="Customers"?customerRows:active==="Contacts"?contactListRows:active==="Employees"?employeeRows:active==="Tasks"?taskRows:active==="Opportunities"?[...opportunityRows,...quotationRows]:undefined} query={query} filter={filter} setFilter={setFilter} announce={announce} onNewContact={() => { setEditingCustomer(null); setCustomerPage("Contacts"); setContactRows([1]); setDrawer(true); }} onDeleteCommercial={record=>{if(window.confirm(`Delete ${record.name} from the commercial list?`)){record.id.startsWith("QUO-")?setQuotationRows(rows=>rows.filter(row=>row.id!==record.id)):setOpportunityRows(rows=>rows.filter(row=>row.id!==record.id));announce(`${record.name} deleted`)}}} onDeleteContact={contact=>{if(window.confirm(`Delete ${contact.name} from the contact list?`)){setContactListRows(rows=>rows.filter(row=>row.id!==contact.id));announce(`${contact.name} deleted`)}}} onDeleteCustomer={customer=>{if(window.confirm(`Delete ${customer.name} from the client list?`)){setCustomerRows(rows=>rows.filter(row=>row.id!==customer.id));announce(`${customer.name} deleted`)}}} onDeleteEmployee={employee=>{if(window.confirm(`Delete ${employee.name} from the employee list?`)){setEmployeeRows(rows=>rows.filter(row=>row.id!==employee.id));announce(`${employee.name} deleted`)}}} onEditCustomer={customer => { setEditingCustomer(customer); setCustomerPage("General"); setOpportunitySection("Client"); setContactRows([1]); setDrawer(true); }} />}
      {active === "Directory" && <Directory announce={announce} targetGroup={directoryTarget} />}
      {active === "Reports" && <Reports announce={announce} />}
    </section>

    {drawer && <div className={`drawer-backdrop ${editingCustomer&&active==="Customers"?"customer-fullpage":""}`} onMouseDown={() => setDrawer(false)}>
      <aside className="drawer access-drawer" role="dialog" aria-modal="true" aria-label={`${editingCustomer?"Edit":"Add"} ${actionName}`} onMouseDown={e => e.stopPropagation()}>
        <div className="drawer-head"><div><p>{accessFormName || "Customer record"}</p><h2>{editingCustomer?editingCustomer.name:`New ${actionName}`}</h2><small>{editingCustomer?`Editing ${editingCustomer.id}`:"Fields mapped from CRM-2026-V3 Access"}</small></div><div className="drawer-title-actions">{editingCustomer&&active==="Customers"&&<><button className="shortcut" onClick={()=>setCustomerPage("Contacts")}>Contact list</button></>}<button onClick={() => setDrawer(false)} aria-label="Close">x</button></div></div>
        {active === "Customers" && <nav className="customer-tabs" aria-label="Customer form pages">{customerPages.map(page=><button key={page.name} className={customerPage===page.name?"active":""} onClick={()=>setCustomerPage(page.name)}><span>{page.icon}</span>{page.name==="General"?"Client":page.name}</button>)}</nav>}
        <form key={`${editingCustomer?.id||"new"}-${customerPage}`} className={active === "Customers" ? "has-tabs" : active==="Opportunities"?"has-opportunity-tabs":""} onSubmit={saveDrawer}>
          {active === "Opportunities" && <nav className="opportunity-section-tabs" aria-label="Opportunity form pages">{activeForm?.groups.filter(group=>!["Inquiry","Client"].includes(String(group[0]))).map(group=>{const title=String(group[0]);const locked=title==="Client order"&&!clientOrderEnabled;return <button type="button" key={title} className={opportunitySection===title?"active":""} aria-selected={opportunitySection===title} disabled={locked} title={locked?"Enable Client order from the TPS offer page":""} onClick={()=>!locked&&setOpportunitySection(title)}>{title}</button>})}</nav>}
          {active === "Customers" && customerPage === "Contacts" ? <MultiContacts rows={contactRows} add={() => setContactRows(rows => [...rows, Math.max(...rows)+1])} remove={id => setContactRows(rows => rows.filter(row => row !== id))} /> : drawerGroups?.map(([title,fields]: [string,string[]])=><fieldset key={title} className={active==="Opportunities"?(title==="Inquiry"?"opportunity-inquiry-summary":title==="Client"?"opportunity-client-summary":"opportunity-page"):undefined} hidden={active==="Opportunities"&&!["Inquiry","Client",opportunitySection].includes(title)}><legend>{title}</legend><div className="drawer-field-grid">{fields.map(field=><label key={field}>{field}{field.includes("Notes")||field.includes("Scope")||field.includes("History")||field.includes("Comments")||field.includes("Milestone")?<textarea defaultValue={customerFieldValue(field,editingCustomer,active)}/>:field.includes("Date")||field.includes("Due")?<input type="date"/>:field.includes("Status")||field.includes("Type")||field.includes("Category")||field.includes("Currency")||field.includes("Handled")||field.includes("Assigned To")||field.includes("Responsible")||field==="Employee"||field==="Client"?<select defaultValue={customerFieldValue(field,editingCustomer,active)}><option value="">Select...</option>{(field==="Client"?[...records.Customers.map(client=>client.name),"Add / modify clients..."]:(field.includes("Handled")||field.includes("Assigned To")||field.includes("Responsible")||field==="Employee"?employeeRows.map(employee=>employee.name):selectValues(field,active))).map(value=><option key={value} value={value==="Add / modify clients..."?"__manage_clients":value}>{value}</option>)}</select>:field.includes("FLAG")||field==="Submitted"||field==="Closed"||field==="Done"?<input type="checkbox"/>:<input defaultValue={customerFieldValue(field,editingCustomer,active)} placeholder={field}/>}</label>)}</div></fieldset>)}
          {active==="Opportunities"&&<div className="client-order-gate" hidden={opportunitySection!=="TPS offer"}><div><strong>Client order access</strong><small>{clientOrderEnabled?"The Client order page is available.":"Enable this after the TPS offer is approved."}</small></div><button type="button" className={clientOrderEnabled?"enabled":""} onClick={()=>{setClientOrderEnabled(value=>!value);if(clientOrderEnabled&&opportunitySection==="Client order")setOpportunitySection("TPS offer")}}>{clientOrderEnabled?"Disable client order":"Enable client order"}</button></div>}
          {!(active==="Customers"&&!['General','Contacts'].includes(customerPage))&&<div className="form-actions"><button type="button" onClick={() => setDrawer(false)}>Cancel</button><button type="submit">{editingCustomer?`Save ${actionName} changes`:`Create ${actionName}`}</button></div>}
        </form>
      </aside>
    </div>}
    {notice && <div className="toast" role="status">Done - {notice}</div>}
  </main>;
}

function MultiContacts({rows,add,remove}:{rows:number[],add:()=>void,remove:(id:number)=>void}) {
  const clientId=`CUS-${rows[0]}`;
  const contactData=[
    {clientId:"CUS-1048",name:"Olivia Martin",job:"General Manager",department:"Management",phone:"+966 55 204 1180",email:"olivia@acme.example",role:"Primary"},
    {clientId:"CUS-1048",name:"Daniel Reed",job:"Procurement Manager",department:"Procurement",phone:"+966 50 441 8270",email:"daniel@acme.example",role:"Commercial"},
    {clientId:"CUS-1048",name:"Maya Hassan",job:"Project Engineer",department:"Engineering",phone:"+966 54 118 3095",email:"maya@acme.example",role:"Technical"},
    {clientId:"CUS-1047",name:"James Wilson",job:"Project Director",department:"Projects",phone:"+966 54 822 4012",email:"james@northstar.example",role:"Primary"},
    {clientId:"CUS-1046",name:"Emma Thompson",job:"Procurement Lead",department:"Procurement",phone:"+966 50 314 8870",email:"emma@mira.example",role:"Commercial"},
    {clientId:"CUS-1045",name:"Noah Anderson",job:"Technical Manager",department:"Engineering",phone:"+966 56 702 1994",email:"noah@vertex.example",role:"Technical"},
  ].filter(contact=>contact.clientId===clientId);
  const [selected,setSelected]=useState<(typeof contactData)[number]|null>(null);
  const [isNew,setIsNew]=useState(false);
  if(selected||isNew){const contact=selected;return <section className="contact-detail"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>{setSelected(null);setIsNew(false)}}>&lt;- Contact list</button><h3>{isNew?"New contact":contact?.name}</h3></div></div><fieldset><legend>Contact details</legend><div className="drawer-field-grid"><label>First Name<input defaultValue={contact?.name.split(" ")[0]||""}/></label><label>Last Name<input defaultValue={contact?.name.split(" ").slice(1).join(" ")||""}/></label><label>Job Title<input defaultValue={contact?.job||""}/></label><label>Department<input defaultValue={contact?.department||""}/></label><label>Business Phone<input defaultValue={contact?.phone||""}/></label><label>Mobile Phone<input defaultValue={contact?.phone||""}/></label><label>E-mail Address<input type="email" defaultValue={contact?.email||""}/></label><label>Role<select defaultValue={contact?.role||"Primary"}><option>Primary</option><option>Commercial</option><option>Technical</option><option>Finance</option></select></label><label className="contact-notes">Notes<textarea/></label></div></fieldset></section>}
  return <section className="related-list"><div className="related-head"><div><h3>Contact list</h3><p>{contactData.length} contacts linked to this customer</p></div><button type="button" onClick={()=>setIsNew(true)}>+ New contact</button></div><div className="table-scroll"><table><thead><tr><th>Contact</th><th>Job title</th><th>Department</th><th>Mobile phone</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>{contactData.map(contact=><tr key={contact.email} className="record-row" onClick={()=>setSelected(contact)}><td><strong>{contact.name}</strong></td><td>{contact.job}</td><td>{contact.department}</td><td>{contact.phone}</td><td>{contact.email}</td><td><span className="status-pill neutral">{contact.role}</span></td><td><button type="button" className="open-record" onClick={e=>{e.stopPropagation();setSelected(contact)}}>View</button></td></tr>)}</tbody></table></div></section>;
}


function CustomerQuotationList({customer,contacts,announce,employees,items,setItems,onWon}:{customer:Row|null,contacts:Row[],announce:(message:string)=>void,employees:Row[],items:Row[],setItems:Dispatch<SetStateAction<Row[]>>,onWon:(project:WonProject)=>void}) {
  const [selected,setSelected]=useState<Row|null>(null);const [isNew,setIsNew]=useState(false);const [detailView,setDetailView]=useState<"Inquiry Information"|"History">("Inquiry Information");const [historyById,setHistoryById]=useState<Record<string,string[]>>({});const nameRef=useRef<HTMLInputElement>(null);const valueRef=useRef<HTMLInputElement>(null);const ownerRef=useRef<HTMLSelectElement>(null);const noteRef=useRef<HTMLTextAreaElement>(null);
  const customerItems=items.filter(item=>item.account===customer?.name);
  const fallbackContact=customer?.account&&customer.account!=="No primary contact"&&!/^[+\d]/.test(customer.account)?[{client:customer.name,name:customer.account,phone:"",region:"",location:""}]:[];
  const contactOptions=[...clientContactDetails.filter(contact=>contact.client===customer?.name),...contacts.filter(contact=>contact.account===customer?.name).map(contact=>({client:contact.account,name:contact.name,phone:contact.phone||"",region:contact.region||"",location:contact.location||""})),...fallbackContact].filter((contact,index,list)=>list.findIndex(item=>item.name===contact.name)===index);
  const [contactName,setContactName]=useState(contactOptions[0]?.name||"");
  const primaryContact=contactOptions.find(contact=>contact.name===contactName);
  const save=()=>{const name=nameRef.current?.value.trim();if(!name){announce("Project Name is required");return;}const statusLabel=Array.from(document.querySelectorAll("label")).find(label=>label.childNodes[0]?.textContent?.trim()==="Client Inquiry Status");const status=(statusLabel?.querySelector("select") as HTMLSelectElement|null)?.value||selected?.status||"On Hand";const item:Row={id:selected?.id||`OPP-${285+items.length}`,name,account:customer?.name||"",value:valueRef.current?.value.trim()||selected?.value||"$0",status,owner:ownerRef.current?.value||selected?.owner||"Alex Morgan",date:new Date().toLocaleDateString()};const note=noteRef.current?.value.trim()||"";const historyEntry=`${new Date().toLocaleString()} — ${selected?"Updated":"Created"}: ${item.name}; status ${item.status}; value ${item.value}; handled by ${item.owner}${note?`; note: ${note}`:""}`;setHistoryById(history=>({...history,[item.id]:[historyEntry,...(history[item.id]||[])]}));if(status==="Won"){onWon({id:item.id.replace(/^QUO|^OPP/,"PRJ"),customerId:customer?.id||"",name:item.name,type:"Opportunity conversion",status:"New",progress:"0%",start:new Date().toLocaleDateString(),due:"To be scheduled"});setItems(rows=>rows.filter(row=>row.id!==item.id));setSelected(null);setIsNew(false);announce("Won opportunity transferred to the Project list");return;}setItems(rows=>selected?rows.map(row=>row.id===selected.id?item:row):[item,...rows]);setSelected(null);setIsNew(false);announce(note?"Opportunity saved and note moved to History":"Opportunity saved in the client and workspace lists")};
  const addNoteToHistory=()=>{const note=noteRef.current?.value.trim()||"";if(!note){announce("Enter a note first");return;}if(!selected?.id){announce("Save the opportunity before adding history notes");return;}const entry=`${new Date().toLocaleString()} — Note: ${note}`;setHistoryById(history=>({...history,[selected.id]:[entry,...(history[selected.id]||[])]}));if(noteRef.current)noteRef.current.value="";announce("Note added to History with date and time")};
  if(selected||isNew)return <section className="contact-detail opportunity-access"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>{setSelected(null);setIsNew(false)}}>&lt;- Opportunity list</button><h3>{isNew?"New opportunity":selected?.name}</h3></div><button type="button" onClick={save}>Save Opportunities</button></div>
    <fieldset><legend>Inquiry</legend><div className="drawer-field-grid"><label>OpportunityID<input defaultValue={selected?.id||""}/></label><label>Document Type<select defaultValue=""><option value="">Select...</option><option>Case</option><option>Case Solved</option><option>Delivered</option><option>Inquiry</option><option>Letter</option><option>Offer</option><option>Order</option><option>Task</option><option>Secured</option></select></label><label>Inquiry No / RFQ No<input defaultValue={selected?.id||""}/></label><label>Scope Note<textarea/></label><label>Inquiry Date<input type="date"/></label><label>Inquiry Submission Date<input type="date"/></label><label>Submitted<input type="checkbox"/></label><label>Project Name<input defaultValue={selected?.name||""}/></label><label>Opportunity Type<select defaultValue=""><option value="">Select...</option>{selectValues("Opportunity Type").map(value=><option key={value}>{value}</option>)}</select></label><label>Year<input type="number" defaultValue={new Date().getFullYear()}/></label></div></fieldset>
    <fieldset><legend>Client</legend><div className="drawer-field-grid"><label>Client<input value={customer?.name||selected?.account||""} readOnly/></label><label>Contact Person<select value={contactName} onChange={event=>setContactName(event.target.value)} disabled={!contactOptions.length}><option value="">{contactOptions.length?"Select contact person...":"No contacts linked to this client"}</option>{contactOptions.map(contact=><option key={contact.name} value={contact.name}>{contact.name}</option>)}</select></label><label>Telephone<input value={primaryContact?.phone||""} readOnly/></label><label>Region<input value={primaryContact?.region||""} readOnly/></label><label>Location<input value={primaryContact?.location||""} readOnly/></label><label>Consultant<input/></label><label>End User<input value={customer?.name||selected?.account||""} readOnly/></label><label>Client Inquiry Status<select defaultValue={selected?.status||"On Hand"}><option>On Hand</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Won</option></select></label></div></fieldset>
    <fieldset><legend>Ownership &amp; status</legend><div className="drawer-field-grid"><label>Employee<select defaultValue={selected?.owner||employees[0]?.name||""}>{employees.map(employee=><option key={employee.id}>{employee.name}</option>)}</select></label><label>How Found Type<select defaultValue="Current Client"><option>Current Client</option><option>Referral</option><option>Website</option><option>Tender Portal</option><option>Consultant</option><option>Other</option></select></label><label>Closed<input type="checkbox"/></label><label>Status of Call<select defaultValue="Active"><option>Active</option><option>Pending</option><option>Completed</option><option>Closed</option></select></label><label>Last Call Date<input type="date"/></label><label>Next Call Date<input type="date"/></label><label>Proposal Status<select defaultValue={selected?.status||"Active"}><option>Active</option><option>Pending</option><option>Completed</option></select></label><label>Client Project Status<select defaultValue="New"><option>New</option><option>In progress</option><option>On hold</option><option>Completed</option><option>Cancelled</option></select></label></div></fieldset>
    <fieldset><legend>Opportunity details</legend><div className="drawer-field-grid opportunity-summary"><label>Client / Supplier<select defaultValue={customer?.name||""}><option>{customer?.name||"Current client"}</option>{supplierNames.map(name=><option key={name}>{name}</option>)}</select></label><label>Type<select defaultValue=""><option value="">Choose...</option><option>Spare Parts</option><option>Canal Water</option><option>Grey Water</option><option>Sanitary Waste Water Plant</option><option>Desilination Plant</option><option>DAMS &amp; RAINWATER PLANTS</option><option>Others</option></select></label><label>Project Name<input ref={nameRef} defaultValue={selected?.name||""}/></label><label>Client Inquiry Status<select defaultValue={selected?.status||"On Hand"}><option>On Hand</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Won</option></select></label><label>Document Type<select defaultValue=""><option value="">Choose...</option><option>Case</option><option>Case Solved</option><option>Delivered</option><option>Inquiry</option><option>Letter</option><option>Offer</option><option>Order</option><option>Task</option><option>Secured</option></select></label><label>Handled by<select ref={ownerRef} defaultValue={selected?.owner||employees[0]?.name||""}>{employees.map(employee=><option key={employee.id}>{employee.name}</option>)}</select></label><label>Year<input type="number" defaultValue={new Date().getFullYear()}/></label></div></fieldset>
    <fieldset className="scope-under-document"><legend>Scope of Work</legend><textarea placeholder="Enter the opportunity scope of work"/></fieldset>
    <nav className="opportunity-subtabs"><button type="button" className={detailView==="Inquiry Information"?"active":""} onClick={()=>setDetailView("Inquiry Information")}>Inquiry Information</button><button type="button" className={detailView==="History"?"active":""} onClick={()=>setDetailView("History")}>History</button></nav>
    {detailView==="History"?<fieldset><legend>History</legend><label className="history-note-field">Notes<textarea ref={noteRef} placeholder="Enter a note to add to History"/><button type="button" onClick={addNoteToHistory}>Add note to history</button></label><div className="opportunity-history">{(historyById[selected?.id||""]||[]).length?(historyById[selected?.id||""]||[]).map((entry,index)=><p key={`${entry}-${index}`}>{entry}</p>):<p>No history recorded yet.</p>}</div></fieldset>:<div className="opportunity-section-grid"><fieldset><legend>Inquiry Details</legend><div className="drawer-field-grid"><label>Inquiry No.<input defaultValue={selected?.id||""}/></label><label>Inquiry Date<input type="date"/></label><label>End User<input defaultValue="Private"/></label><label>How Found<select defaultValue="Current Client"><option>Current Client</option><option>Referral</option><option>Website</option><option>Tender Portal</option><option>Consultant</option><option>Other</option></select></label><label>Consultant<input/></label><label>Inquiry Submission Date<input type="date"/></label><label className="contact-notes">Scope of Work<textarea/></label></div></fieldset><fieldset><legend>Principle Information</legend><div className="drawer-field-grid"><label>Name<select defaultValue=""><option value="">Choose...</option>{supplierNames.map(name=><option key={name}>{name}</option>)}</select></label><label>Offer #<input/></label><label>Date<input type="date"/></label><label>Currency<select defaultValue="SAR"><option>SAR</option><option>USD</option><option>EUR</option></select></label><label>Total Offer<input ref={valueRef} defaultValue={selected?.value||""}/></label></div></fieldset><fieldset><legend>Offer Information</legend><div className="drawer-field-grid"><label>Offer #<input defaultValue={selected?.id||""}/></label><label>Offer Date<input type="date"/></label><label>Submission Date<input type="date"/></label><label>Currency<select defaultValue="SAR"><option>SAR</option><option>USD</option><option>EUR</option></select></label><label>Total Offer<input defaultValue={selected?.value||""}/></label></div></fieldset><fieldset><legend>Link Information</legend><div className="drawer-field-grid"><label>Folder<input placeholder="Shared folder or document link"/></label><label>Project Milestone<input/></label></div></fieldset></div>}
  </section>;
  return <section className="related-list"><div className="related-head"><div><h3>Opportunity list</h3><p>{customerItems.length} opportunities linked to this client</p></div><button type="button" onClick={()=>setIsNew(true)}>+ New opportunity</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Opportunity</th><th>Value</th><th>Status</th><th>Employee</th><th>Date</th><th>Actions</th></tr></thead><tbody>{customerItems.map(item=><tr key={item.id} className="record-row" onClick={()=>setSelected(item)}><td><span className="record-id">{item.id}</span></td><td><strong>{item.name}</strong></td><td>{item.value}</td><td><Status value={item.status}/></td><td>{item.owner}</td><td>{item.date}</td><td><div className="row-actions"><button type="button" className="open-record" onClick={e=>{e.stopPropagation();setSelected(item)}}>Edit</button><button type="button" className="delete-record" onClick={e=>{e.stopPropagation();if(window.confirm(`Delete ${item.name}?`)){setItems(rows=>rows.filter(row=>row.id!==item.id));announce("Opportunity deleted")}}}>Del</button></div></td></tr>)}</tbody></table></div></section>;
}

function CustomerOpportunities({customer,employees,items,setItems,announce,onWon,onConvert}:{customer:Row|null,employees:Row[],items:CustomerOpportunity[],setItems:Dispatch<SetStateAction<CustomerOpportunity[]>>,announce:(message:string)=>void,onWon:(project:WonProject)=>void,onConvert:(opportunity:{id:string,name:string,value:string,owner:string})=>void}) {
  const customerItems=items.filter(item=>item.customerId===customer?.id);
  const [selected,setSelected]=useState<(typeof items)[number]|null>(null);
  const [isNew,setIsNew]=useState(false);
  const [stage,setStage]=useState("Qualified");
  const nameRef=useRef<HTMLInputElement>(null);
  const valueRef=useRef<HTMLInputElement>(null);
  const ownerRef=useRef<HTMLSelectElement>(null);
  const typeRef=useRef<HTMLSelectElement>(null);
  const documentTypeRef=useRef<HTMLSelectElement>(null);
  const [opportunityView,setOpportunityView]=useState<"Inquiry Information"|"History">("Inquiry Information");
  const saveOpportunity=()=>{
    const name=nameRef.current?.value.trim()||selected?.name||"";
    if(!name){announce("Project Name is required");return;}
    const saved:CustomerOpportunity={customerId:customer?.id||"",id:selected?.id||`OPP-${String(285+items.length).padStart(3,"0")}`,name,type:typeRef.current?.value||"Choose...",documentType:documentTypeRef.current?.value||"",value:valueRef.current?.value.trim()||selected?.value||"0",stage,owner:ownerRef.current?.value||employees[0]?.name||"",close:selected?.close||new Date().toISOString().slice(0,10)};
    setItems(rows=>selected?rows.map(row=>row.id===selected.id?saved:row):[saved,...rows]);
    if(documentTypeRef.current?.value==="Offer"){
      onConvert(saved);
    } else if(stage==="Won"){
      onWon({id:selected?.id||`PRJ-${120+items.length}`,customerId:customer?.id||"",name,type:"Opportunity conversion",status:"New",progress:"0%",start:new Date().toLocaleDateString(),due:"To be scheduled"});
      announce("Won opportunity transferred to the Project list");
    } else announce(isNew?"New opportunity saved to the list":"Opportunity changes saved and updated in the list");
    setSelected(null);setIsNew(false);
  };
  if(selected||isNew)return <section className="contact-detail opportunity-access"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>{setSelected(null);setIsNew(false)}}>&lt;- Opportunity list</button><h3>{isNew?"New opportunity":selected?.name}</h3></div><div className="row-actions">{selected&&<button type="button" className="secondary convert-button" onClick={e=>{e.preventDefault();e.stopPropagation();onConvert({...selected,name:nameRef.current?.value.trim()||selected.name,value:valueRef.current?.value.trim()||selected.value,owner:ownerRef.current?.value||selected.owner})}}>Convert to quotation</button>}<button type="button" onClick={saveOpportunity}>Save opportunity</button></div></div>
    <fieldset><legend>Opportunity details</legend><div className="drawer-field-grid opportunity-summary"><label>Client / Supplier<select defaultValue={customer?.name||""}><option>{customer?.name||"Current customer"}</option>{supplierNames.map(name=><option key={name}>{name}</option>)}</select></label><label>Opportunity Type<select ref={typeRef} defaultValue=""><option value="">Choose...</option><option>Canal Water</option><option>Grey Water</option><option>Sanitary Waste Water Plant</option><option>Desilination Plant</option><option>DAMS &amp; RAINWATER PLANTS</option><option>Others</option></select></label><label>Project Name<input ref={nameRef} defaultValue={selected?.name||""}/></label><label>Client Inquiry Status<select value={stage} onChange={e=>setStage(e.target.value)}><option>On Hand</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Won</option></select></label><label>Document Type<select ref={documentTypeRef} defaultValue={selected?.documentType||""}><option value="">Choose...</option><option>Case</option><option>Case Solved</option><option>Delivered</option><option>Inquiry</option><option>Letter</option><option>Offer</option><option>Order</option><option>Task</option><option>Secured</option></select></label><label>Handled By<select ref={ownerRef} defaultValue={selected?.owner||employees[0]?.name||""} aria-label="Responsible TPS employee">{employees.map(employee=><option key={employee.id} value={employee.name}>{employee.name}</option>)}</select></label><label>Year<input type="number" defaultValue={new Date().getFullYear()}/></label></div></fieldset>
    <nav className="opportunity-subtabs" aria-label="Opportunity information pages"><button type="button" className={opportunityView==="Inquiry Information"?"active":""} onClick={()=>setOpportunityView("Inquiry Information")}>Inquiry Information</button><button type="button" className={opportunityView==="History"?"active":""} onClick={()=>setOpportunityView("History")}>History</button></nav>
    {opportunityView==="History"?<fieldset><legend>Opportunity history</legend><div className="opportunity-history"><p>No updates have been recorded yet.</p><small>Saved changes will appear here with their date and time.</small></div></fieldset>:<div className="opportunity-section-grid">
      <fieldset><legend>Inquiry Details</legend><div className="drawer-field-grid"><label>Inquiry No.<input defaultValue={selected?.id||"New"}/></label><label>Inquiry Date<input type="date"/></label><label>End User<input defaultValue="Private"/></label><label>How Found<select defaultValue="Current Customer"><option>Current Customer</option><option>Referral</option><option>Website</option><option>Other</option></select></label><label>Consultant<input/></label><label>Inquiry Submission Date<input type="date"/></label><label className="contact-notes">Scope of Work<textarea/></label></div></fieldset>
      <fieldset><legend>Principal Information</legend><div className="drawer-field-grid"><label>Principal Name<select defaultValue=""><option value="">Select supplier...</option>{supplierNames.map(name=><option key={name}>{name}</option>)}</select></label><label>Principal Offer No.<input/></label><label>Principal Offer Date<input type="date"/></label><label>Currency<select defaultValue="SAR"><option>SAR</option><option>USD</option><option>EUR</option></select></label><label>Total Principal Offer<input ref={valueRef} defaultValue={selected?.value||""}/></label></div></fieldset>
      <fieldset><legend>Offer Information</legend><div className="drawer-field-grid"><label>Offer No.<input defaultValue={selected?.id?.replace("OPP","OFF")||""}/></label><label>Offer Date<input type="date"/></label><label>Submission Date<input type="date"/></label><label>Currency<select defaultValue="SAR"><option>SAR</option><option>USD</option><option>EUR</option></select></label><label>Total Offer<input defaultValue={selected?.value||""}/></label></div></fieldset>
      <fieldset><legend>Link Information</legend><div className="drawer-field-grid"><label className="contact-notes">Folder / Document Link<input type="url" placeholder="https:// or shared folder path"/></label><label className="contact-notes">Project Milestone<textarea placeholder="Enter the next project milestone"/></label></div></fieldset>
    </div>}
  </section>;
  return <section className="related-list"><div className="related-head"><div><h3>Opportunity list</h3><p>{customerItems.length} opportunities linked to this customer</p></div><button type="button" onClick={()=>{setSelected(null);setStage("Qualified");setIsNew(true)}}>+ New opportunity</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Opportunity</th><th>Type</th><th>Value</th><th>Stage</th><th>Owner</th><th>Close date</th></tr></thead><tbody>{customerItems.map(item=><tr key={item.id} className="record-row" onClick={()=>{setSelected(item);setStage(item.stage);setIsNew(false)}}><td><span className="record-id">{item.id}</span></td><td><strong>{item.name}</strong></td><td>{item.type}</td><td>{item.value}</td><td><Status value={item.stage}/></td><td>{item.owner}</td><td>{item.close}</td></tr>)}</tbody></table></div></section>;
}

function CustomerSuppliers({announce}:{announce:(message:string)=>void}) {
  const suppliers=[
    {id:"SUP-073",name:supplierNames[0],category:"Industrial equipment",scope:"Pumps, valves, control panels and mechanical spare parts",contact:"Omar Al-Salem",phone:"+966 55 810 2240",email:"omar@gulf-industrial.example",status:"Active"},
    {id:"SUP-061",name:supplierNames[1],category:"Electrical systems",scope:"Switchgear, circuit breakers, PLCs and power distribution equipment",contact:"Nadia Faris",phone:"+966 50 412 8891",email:"nadia@schneider.example",status:"Active"},
    {id:"SUP-054",name:supplierNames[2],category:"Process automation",scope:"Instrumentation, transmitters, control valves and automation systems",contact:"Khalid Mansour",phone:"+966 54 220 1478",email:"khalid@emerson.example",status:"Approved"},
  ];
  const [selected,setSelected]=useState<(typeof suppliers)[number]|null>(null);
  const [savedMessage,setSavedMessage]=useState("");
  if(selected)return <section className="contact-detail"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>setSelected(null)}>&lt;- Supplier list</button><h3>{selected.name}</h3></div><button type="button" onClick={()=>{const message=`Supplier data saved successfully at ${new Date().toLocaleTimeString()}`;setSavedMessage(message);announce(message)}}>Save supplier</button></div>{savedMessage&&<div className="save-confirmation" role="status"><strong>Saved</strong><span>{savedMessage}</span></div>}<fieldset><legend>Supplier details</legend><div className="drawer-field-grid"><label>Supplier ID<input defaultValue={selected.id}/></label><label>Supplier Name<input defaultValue={selected.name}/></label><label>Category<input defaultValue={selected.category}/></label><label>Status<select defaultValue={selected.status}><option>Active</option><option>Approved</option><option>Pending</option><option>Inactive</option></select></label><label className="contact-notes">Scope of Supply / What they sell<textarea required defaultValue={selected.scope} placeholder="Describe the products and services supplied"/></label><label>Contact Person<input defaultValue={selected.contact}/></label><label>Phone<input defaultValue={selected.phone}/></label><label>Email<input defaultValue={selected.email}/></label><label className="contact-notes">Notes<textarea/></label></div></fieldset></section>;
  return <section className="related-list"><div className="related-head"><div><h3>Supplier list</h3><p>{suppliers.length} linked supplier references — supplier information is stored separately</p></div><button type="button" onClick={()=>announce("Use the Suppliers screen to add a new supplier")}>+ New supplier</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Supplier</th><th>Category</th><th>Scope of supply</th><th>Contact</th><th>Phone</th><th>Email</th><th>Status</th></tr></thead><tbody>{suppliers.map(supplier=><tr key={supplier.id} className="record-row" onClick={()=>setSelected(supplier)}><td><span className="record-id">{supplier.id}</span></td><td><strong>{supplier.name}</strong></td><td>{supplier.category}</td><td>{supplier.scope}</td><td>{supplier.contact}</td><td>{supplier.phone}</td><td>{supplier.email}</td><td><Status value={supplier.status}/></td></tr>)}</tbody></table></div></section>;
}

function CustomerProjects({customer,announce,wonProjects}:{customer:Row|null,announce:(message:string)=>void,wonProjects:WonProject[]}) {
  const baseItems=[
    {customerId:"CUS-1048",id:"PRJ-119",name:"Q3 platform rollout",type:"Implementation",status:"In progress",progress:"72%",start:"Jun 4, 2026",due:"Sep 12, 2026"},
    {customerId:"CUS-1047",id:"PRJ-103",name:"CRM onboarding",type:"Onboarding",status:"Completed",progress:"100%",start:"Mar 10, 2026",due:"Jul 29, 2026"},
  ];
  const items=[...wonProjects,...baseItems].filter(item=>item.customerId===customer?.id);
  const [selected,setSelected]=useState<(typeof items)[number]|null>(null);
  if(selected)return <section className="contact-detail"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>setSelected(null)}>&lt;- Project list</button><h3>{selected.name}</h3></div></div><fieldset><legend>Project details</legend><div className="drawer-field-grid"><label>Project ID<input defaultValue={selected.id}/></label><label>Project Name<input defaultValue={selected.name}/></label><label>Project Type<input defaultValue={selected.type}/></label><label>Status<select defaultValue={selected.status}><option>In progress</option><option>Review</option><option>Completed</option><option>On hold</option></select></label><label>Progress<input defaultValue={selected.progress}/></label><label>Start Date<input defaultValue={selected.start}/></label><label>Estimated End Date<input defaultValue={selected.due}/></label><label>Actual Revenue<input/></label><label>Currency<select defaultValue="SAR"><option>SAR</option><option>USD</option><option>EUR</option></select></label><label className="contact-notes">Notes<textarea/></label></div></fieldset></section>;
  return <section className="related-list"><div className="related-head"><div><h3>Project list</h3><p>{items.length} projects linked to this customer</p></div><button type="button" onClick={()=>announce("New project form opened")}>+ New project</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Project</th><th>Type</th><th>Status</th><th>Progress</th><th>Start</th><th>Due</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="record-row" onClick={()=>setSelected(item)}><td><span className="record-id">{item.id}</span></td><td><strong>{item.name}</strong></td><td>{item.type}</td><td><Status value={item.status}/></td><td>{item.progress}</td><td>{item.start}</td><td>{item.due}</td></tr>)}</tbody></table></div></section>;
}

function CustomerActivities({announce}:{announce:(message:string)=>void}) {
  const items=[
    {id:"ACT-108",type:"Phone call",subject:"Offer follow-up",owner:"Sarah Chen",date:"Aug 4, 2026",status:"Completed",notes:"Client requested revised delivery terms."},
    {id:"ACT-107",type:"Meeting",subject:"Technical clarification",owner:"David Kim",date:"Aug 2, 2026",status:"Completed",notes:"Reviewed scope and equipment specifications."},
    {id:"ACT-106",type:"Email",subject:"Supplier offer shared",owner:"Alex Morgan",date:"Jul 30, 2026",status:"Completed",notes:"Sent preliminary commercial offer."},
    {id:"ACT-105",type:"Site visit",subject:"Project readiness review",owner:"David Kim",date:"Aug 8, 2026",status:"Scheduled",notes:"Confirm access and installation requirements."},
  ];
  const [selected,setSelected]=useState<(typeof items)[number]|null>(null);
  const [isNew,setIsNew]=useState(false);
  const [descriptionDraft,setDescriptionDraft]=useState("");
  const [descriptionVersion,setDescriptionVersion]=useState(0);
  const [historyEntries,setHistoryEntries]=useState<string[]>(["08/04/2026, 09:15 AM — Activity record created"]);
  if(selected||isNew)return <section className="contact-detail"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>{setSelected(null);setIsNew(false);setDescriptionDraft("")}}>&lt;- Activity list</button><h3>{isNew?"New activity":selected?.subject}</h3></div><button type="button" onClick={()=>{const description=descriptionDraft.trim();if(!description){announce("Write a description before saving");return;}setHistoryEntries(entries=>[`${new Date().toLocaleString()} — ${description}`,...entries]);setDescriptionDraft("");setDescriptionVersion(version=>version+1);announce("Description moved to history with date and time")}}>Save activity</button></div><fieldset><legend>Activity details</legend><div className="drawer-field-grid"><label>Activity ID<input defaultValue={selected?.id||"New"} readOnly={isNew}/></label><label>Activity Type<select defaultValue={selected?.type||"Phone call"}><option>Phone call</option><option>Meeting</option><option>Email</option><option>Site visit</option></select></label><label>Activity Date<input type="date" defaultValue={isNew?"2026-08-04":""}/></label><label>Assigned To<select defaultValue={selected?.owner||"Alex Morgan"}><option value="">Select TPS employee...</option><option>Alex Morgan</option><option>Sarah Chen</option><option>David Kim</option></select></label><label>Status<select defaultValue={selected?.status||"Scheduled"}><option>Scheduled</option><option>In progress</option><option>Completed</option><option>Cancelled</option></select></label><label>Subject<input required defaultValue={selected?.subject||""} placeholder="Activity subject"/></label><label className="contact-notes">Description / Notes<VoiceTextarea key={descriptionVersion} defaultValue="" onValueChange={setDescriptionDraft}/></label><label>Attachments<input type="file"/></label><label className="contact-notes history-field">History<textarea readOnly value={historyEntries.join("\n\n")}/><small>Save moves the description here and adds the current date and time.</small></label></div></fieldset></section>;
  return <section className="related-list"><div className="related-head"><div><h3>Activity list</h3><p>{items.length} activities linked to this customer</p></div><button type="button" onClick={()=>setIsNew(true)}>+ New activity</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Type</th><th>Subject</th><th>Owner</th><th>Date</th><th>Status</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="record-row" onClick={()=>setSelected(item)}><td><span className="record-id">{item.id}</span></td><td>{item.type}</td><td><strong>{item.subject}</strong></td><td>{item.owner}</td><td>{item.date}</td><td><Status value={item.status}/></td></tr>)}</tbody></table></div></section>;
}

function CustomerDeliveries({announce}:{announce:(message:string)=>void}) {
  const items=[
    {id:"DEL-028",project:"Q3 platform rollout",po:"PO-2026-184",item:"Control panels",qty:"4",status:"In transit",planned:"Aug 12, 2026",actual:"—",terms:"DAP Riyadh"},
    {id:"DEL-027",project:"CRM onboarding",po:"PO-2026-121",item:"Server equipment",qty:"2",status:"Delivered",planned:"Jul 26, 2026",actual:"Jul 25, 2026",terms:"DDP Riyadh"},
    {id:"DEL-026",project:"Equipment upgrade",po:"PO-2026-098",item:"Pumps and valves",qty:"18",status:"Preparing",planned:"Sep 4, 2026",actual:"—",terms:"CIF Dammam"},
  ];
  const [selected,setSelected]=useState<(typeof items)[number]|null>(null); const [isNew,setIsNew]=useState(false);
  if(selected||isNew)return <section className="contact-detail"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>{setSelected(null);setIsNew(false)}}>&lt;- Delivery list</button><h3>{isNew?"New delivery":selected?.id}</h3></div><button type="button" onClick={()=>{announce(isNew?"New delivery saved":"Delivery changes saved");setSelected(null);setIsNew(false)}}>Save delivery</button></div><fieldset><legend>Delivery details</legend><div className="drawer-field-grid"><label>Delivery ID<input defaultValue={selected?.id||"New"} readOnly={isNew}/></label><label>Project<input defaultValue={selected?.project||""}/></label><label>Customer PO<input defaultValue={selected?.po||""}/></label><label>Item / Equipment<input defaultValue={selected?.item||""}/></label><label>Quantity<input defaultValue={selected?.qty||""}/></label><label>Status<select defaultValue={selected?.status||"Preparing"}><option>Preparing</option><option>Ready to ship</option><option>In transit</option><option>Delivered</option><option>Delayed</option></select></label><label>Planned Delivery Date<input defaultValue={selected?.planned||""}/></label><label>Actual Delivery Date<input defaultValue={selected?.actual||""}/></label><label>Delivery Terms<input defaultValue={selected?.terms||""}/></label><label>Carrier<input/></label><label>Tracking Number<input/></label><label className="contact-notes">Delivery Notes<textarea/></label><label>Attachments<input type="file"/></label></div></fieldset></section>;
  return <section className="related-list"><div className="related-head"><div><h3>Delivery list</h3><p>{items.length} deliveries linked to this customer</p></div><button type="button" onClick={()=>setIsNew(true)}>+ New delivery</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Project</th><th>Customer PO</th><th>Item</th><th>Qty</th><th>Status</th><th>Planned date</th><th>Actual date</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="record-row" onClick={()=>setSelected(item)}><td><span className="record-id">{item.id}</span></td><td><strong>{item.project}</strong></td><td>{item.po}</td><td>{item.item}</td><td>{item.qty}</td><td><Status value={item.status}/></td><td>{item.planned}</td><td>{item.actual}</td></tr>)}</tbody></table></div></section>;
}

function CustomerTasks({announce}:{announce:(message:string)=>void}) {
  const items=[
    {id:"TSK-041",title:"Submit revised offer",priority:"High",status:"In progress",complete:"65%",owner:"Sarah Chen",start:"Aug 2, 2026",due:"Aug 6, 2026",description:"Update delivery terms and commercial validity."},
    {id:"TSK-040",title:"Confirm technical scope",priority:"Medium",status:"Open",complete:"20%",owner:"David Kim",start:"Aug 3, 2026",due:"Aug 8, 2026",description:"Confirm equipment list with the project engineer."},
    {id:"TSK-039",title:"Upload CR documents",priority:"Low",status:"Completed",complete:"100%",owner:"Alex Morgan",start:"Jul 28, 2026",due:"Aug 3, 2026",description:"Attach the latest company registration documents."},
  ];
  const [selected,setSelected]=useState<(typeof items)[number]|null>(null);
  if(selected)return <section className="contact-detail"><div className="related-head"><div><button type="button" className="back-link" onClick={()=>setSelected(null)}>&lt;- Task list</button><h3>{selected.title}</h3></div></div><fieldset><legend>Task details</legend><div className="drawer-field-grid"><label>Task ID<input defaultValue={selected.id}/></label><label>Title<input defaultValue={selected.title}/></label><label>Priority<select defaultValue={selected.priority}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label><label>Status<select defaultValue={selected.status}><option>Open</option><option>In progress</option><option>Completed</option><option>Cancelled</option></select></label><label>% Complete<input defaultValue={selected.complete}/></label><label>Assigned To<select defaultValue={selected.owner}><option value="">Select TPS employee...</option><option>Alex Morgan</option><option>Sarah Chen</option><option>David Kim</option></select></label><label>Start Date<input defaultValue={selected.start}/></label><label>Due Date<input defaultValue={selected.due}/></label><label className="contact-notes">Description<textarea defaultValue={selected.description}/></label><label>Attachments<input type="file"/></label></div></fieldset></section>;
  return <section className="related-list"><div className="related-head"><div><h3>Task list</h3><p>{items.length} tasks linked to this customer</p></div><button type="button" onClick={()=>announce("New task form opened")}>+ New task</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>Task</th><th>Priority</th><th>Status</th><th>Complete</th><th>Assigned to</th><th>Due date</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="record-row" onClick={()=>setSelected(item)}><td><span className="record-id">{item.id}</span></td><td><strong>{item.title}</strong></td><td>{item.priority}</td><td><Status value={item.status}/></td><td>{item.complete}</td><td>{item.owner}</td><td>{item.due}</td></tr>)}</tbody></table></div></section>;
}

function Metric({label,value,detail,kind="up"}:{label:string,value:string,detail:string,kind?:string}) { return <article><div className="metric-top"><span>{label}</span><b>{kind==="up"?"+":"!"}</b></div><strong>{value}</strong><p><em className={kind==="warn"?"warning":""}>{detail}</em></p></article>; }

function Overview({navigate,announce}:{navigate:(label:string)=>void,announce:(message:string)=>void}) { return <>
  <div className="metrics"><Metric label="Clients" value="1,248" detail="Up 8.4% from last month"/><Metric label="Open opportunities" value="84" detail="Up 12.1% from last month"/><Metric label="Pipeline value" value="$2.4M" detail="Up 5.7% from last month"/><Metric label="Tasks due" value="17" detail="5 overdue - needs attention" kind="warn"/></div>
  <div className="main-grid"><article className="panel revenue"><div className="panel-head"><div><h2>Revenue overview</h2><p>Closed-won revenue over the last 6 months</p></div><button className="select" onClick={()=>announce("Revenue period selector opened")}>Last 6 months</button></div><div className="bars" aria-label="Revenue chart"><div style={{height:"38%"}}><span>Mar</span></div><div style={{height:"48%"}}><span>Apr</span></div><div style={{height:"58%"}}><span>May</span></div><div style={{height:"67%"}}><span>Jun</span></div><div style={{height:"78%"}}><span>Jul</span></div><div style={{height:"91%"}}><span>Aug</span></div></div></article>
    <article className="panel activity"><div className="panel-head"><div><h2>Recent activity</h2><p>Latest updates from your team</p></div></div><div className="feed"><div><span className="feed-icon blue">W</span><p><strong>Deal marked as won</strong><small>Northstar expansion</small><time>12 min ago</time></p></div><div><span className="feed-icon purple">C</span><p><strong>New client added</strong><small>Acme Industries</small><time>42 min ago</time></p></div><div><span className="feed-icon teal">P</span><p><strong>Project updated</strong><small>Q3 rollout moved to review</small><time>1 hr ago</time></p></div><div><span className="feed-icon orange">!</span><p><strong>Follow-up overdue</strong><small>Mira Systems renewal call</small><time>3 hrs ago</time></p></div></div></article></div>
  <article className="panel customers"><div className="panel-head"><div><h2>Priority clients</h2><p>Your highest-value active clients</p></div><button className="text-link" onClick={() => navigate("Customers")}>View all clients -&gt;</button></div><MiniCustomers /></article>
  </>; }

function MiniCustomers(){ return <div className="table-scroll"><table><thead><tr><th>Client</th><th>Primary contact</th><th>Client value</th><th>Status</th></tr></thead><tbody>{records.Customers.map(r=><tr key={r.id}><td><span className="customer-avatar blue">{r.name.split(" ").map(x=>x[0]).join("")}</span><strong>{r.name}</strong></td><td>{r.account}</td><td>{r.value}</td><td><Status value={r.status}/></td></tr>)}</tbody></table></div>; }

function Status({value}:{value:string}) { const positive=["Active","Accepted","Completed","In progress"].includes(value); const warning=["At risk","Expired"].includes(value); return <span className={`status-pill ${positive?"positive":warning?"danger":"neutral"}`}>{value}</span>; }

function RecordsPage({module,query,filter,setFilter,announce,onNewContact,onEditCustomer,onDeleteCommercial,onDeleteContact,onDeleteCustomer,onDeleteEmployee,rowsOverride}:{module:string,query:string,filter:string,setFilter:(x:string)=>void,announce:(x:string)=>void,onNewContact:()=>void,onEditCustomer:(customer:Row)=>void,onDeleteCommercial:(record:Row)=>void,onDeleteContact:(contact:Row)=>void,onDeleteCustomer:(customer:Row)=>void,onDeleteEmployee:(employee:Row)=>void,rowsOverride?:Row[]}) {
  const [listSearch,setListSearch]=useState("");
  const rows=rowsOverride||records[module]||[]; const statuses=["All statuses",...Array.from(new Set(rows.map(r=>r.status)))];
  const shown=useMemo(()=>rows.filter(r=>(filter==="All statuses"||r.status===filter)&&Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase())&&Object.values(r).join(" ").toLowerCase().includes(listSearch.toLowerCase())),[rows,query,listSearch,filter]);
  const valueLabel=module==="Projects"?"Progress":module==="Contacts"?"Job title":module==="Tasks"?"Priority":"Value";
  return <><div className="source-note"><span>Access database</span><strong>{sourceCounts[module] ?? rows.length} source records</strong><small>CRM-2026-V3 cloud</small></div><div className="module-metrics"><Metric label={`Total ${module==="Customers"?"clients":module.toLowerCase()}`} value={String(sourceCounts[module] ?? rows.length)} detail="Found in the Access source"/><Metric label="Active this month" value={String(Math.max(1,rows.length*9))} detail="Ready for cloud migration"/><Metric label={module==="Projects"?"On schedule":module==="Contacts"?"Linked to clients":"Data readiness"} value={module==="Projects"?"86%":module==="Contacts"?"94%":"92%"} detail="Validated moments ago"/></div>
    <article className="panel records-panel"><div className="records-toolbar"><div className="segmented"><button className="selected" onClick={()=>setFilter("All statuses")}>All</button><button onClick={()=>setFilter(statuses[1])}>My records</button></div>{["Customers","Suppliers","Projects"].includes(module)&&<label className="list-search">Search<input type="search" value={listSearch} onChange={e=>setListSearch(e.target.value)} placeholder={`Search ${module==="Customers"?"clients":module.toLowerCase()}...`}/></label>}<label>Status<select value={filter} onChange={e=>setFilter(e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select></label><button className="secondary" onClick={()=>announce(`${module} list exported`)}>Download CSV</button></div>
      <div className="table-scroll"><table><thead><tr><th>ID</th><th>{module==="Customers"?"Client":module.slice(0,-1)}</th><th>Client / contact</th><th>Owner</th><th>{valueLabel}</th><th>Status</th><th>{(module==="Opportunities"||module==="Quotations")?"Close date":"Updated / due"}</th><th></th></tr></thead><tbody>{shown.map(r=><tr key={r.id} className="record-row" onClick={()=>(module==="Customers"||module==="Contacts"||module==="Activities"||module==="Employees"||module==="Tasks"||module==="Suppliers"||(module==="Opportunities"||module==="Quotations"))?onEditCustomer(r):announce(`${r.name} details opened`)}><td><span className="record-id">{r.id}</span></td><td><strong>{r.name}</strong></td><td>{r.account}</td><td>{r.owner}</td><td>{r.value}</td><td><Status value={r.status}/></td><td>{r.date}</td><td>{(module==="Customers"||module==="Contacts"||module==="Activities"||module==="Employees"||module==="Tasks"||module==="Suppliers"||(module==="Opportunities"||module==="Quotations"))?<div className="row-actions"><button type="button" className="open-record" onClick={e=>{e.stopPropagation();onEditCustomer(r)}}>Edit</button>{(module==="Opportunities"||module==="Quotations")&&<button type="button" className="delete-record" onClick={e=>{e.stopPropagation();onDeleteCommercial(r)}}>Del</button>}{module==="Contacts"&&<button type="button" className="delete-record" onClick={e=>{e.stopPropagation();onDeleteContact(r)}}>Del</button>}{module==="Customers"&&<button type="button" className="delete-record" onClick={e=>{e.stopPropagation();onDeleteCustomer(r)}}>Del</button>}{module==="Employees"&&<button type="button" className="delete-record" onClick={e=>{e.stopPropagation();onDeleteEmployee(r)}}>Del</button>}</div>:<button className="more" aria-label={`Open ${r.name}`} onClick={()=>announce(`${r.name} details opened`)}>...</button>}</td></tr>)}</tbody></table>{!shown.length&&<p className="empty">No records match your search and filters.</p>}</div></article></>;
}

function CustomerContactList({onNew,announce,onOpenCustomer}:{onNew:()=>void,announce:(x:string)=>void,onOpenCustomer:(customer:Row)=>void}) {
  const [customerFilter,setCustomerFilter]=useState("All clients");
  const [customerSearch,setCustomerSearch]=useState("");
  const contacts=[
    ["Olivia Martin","Acme Industries","General Manager","olivia@acme.example","+966 55 204 1180","Primary"],
    ["James Wilson","Northstar Labs","Project Director","james@northstar.example","+966 54 822 4012","Primary"],
    ["Emma Thompson","Mira Systems","Procurement Lead","emma@mira.example","+966 50 314 8870","Commercial"],
    ["Noah Anderson","Vertex Group","Technical Manager","noah@vertex.example","+966 56 702 1994","Technical"],
  ];
  const customerNames=["All clients",...Array.from(new Set(contacts.map(contact=>contact[1])))];
  const visibleContacts=contacts.filter(contact=>(customerFilter==="All clients"||contact[1]===customerFilter)&&contact.join(" ").toLowerCase().includes(customerSearch.toLowerCase()));
  return <article className="panel customer-contact-list"><div className="panel-head"><div><h2>Client contacts</h2><p>{visibleContacts.length} contact{visibleContacts.length===1?"":"s"} linked to {customerFilter==="All clients"?"all client accounts":customerFilter}</p></div><div className="contact-head-actions"><label>Search<input value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)} placeholder="Client or contact..."/></label><label>Client<select value={customerFilter} onChange={e=>setCustomerFilter(e.target.value)}>{customerNames.map(name=><option key={name}>{name}</option>)}</select></label><button className="primary compact" onClick={onNew}><span>+</span>New contact</button></div></div><div className="table-scroll"><table><thead><tr><th>Contact</th><th>Client</th><th>Job title</th><th>Email</th><th>Mobile phone</th><th>Role</th><th></th></tr></thead><tbody>{visibleContacts.map(c=><tr key={c[0]} className="record-row" onClick={()=>announce(`${c[0]} contact opened`)}><td><strong>{c[0]}</strong></td><td><button className="customer-link" onClick={e=>{e.stopPropagation();const customer=records.Customers.find(item=>item.name===c[1]);if(customer)onOpenCustomer(customer);}}>{c[1]}</button></td><td>{c[2]}</td><td><a href={`mailto:${c[3]}`} onClick={e=>e.stopPropagation()}>{c[3]}</a></td><td>{c[4]}</td><td><span className="status-pill neutral">{c[5]}</span></td><td><button className="more">...</button></td></tr>)}</tbody></table>{visibleContacts.length===0&&<p className="empty">No contacts match this client search.</p>}</div></article>;
}

function Reports({announce}:{announce:(x:string)=>void}) { const [range,setRange]=useState("This quarter"); const [selectedReport,setSelectedReport]=useState("Sales performance"); return <><div className="report-controls"><label>Reporting period<select value={range} onChange={e=>setRange(e.target.value)}><option>This month</option><option>This quarter</option><option>This year</option></select></label><button className="secondary" onClick={()=>announce(`Reports refreshed for ${range}`)}>Refresh data</button></div>
  <div className="metrics"><Metric label="Revenue" value="$1.28M" detail="Up 14.2% vs prior period"/><Metric label="Win rate" value="38.6%" detail="Up 3.8 percentage points"/><Metric label="Average deal" value="$42.8k" detail="Up 6.1% vs prior period"/><Metric label="Sales cycle" value="41 days" detail="4 days faster"/></div>
  <div className="reports-grid"><article className="panel"><div className="panel-head"><div><h2>Pipeline by stage</h2><p>Opportunity value and conversion</p></div></div><div className="funnel"><div><span>Qualification</span><b>$820k</b><i style={{width:"100%"}}/></div><div><span>Discovery</span><b>$615k</b><i style={{width:"76%"}}/></div><div><span>Proposal</span><b>$408k</b><i style={{width:"51%"}}/></div><div><span>Negotiation</span><b>$264k</b><i style={{width:"34%"}}/></div></div></article>
    <article className="panel"><div className="panel-head"><div><h2>Revenue by owner</h2><p>Closed-won performance</p></div></div><div className="leaderboard"><div><span>SC</span><p><strong>Sarah Chen</strong><small>$486,200</small></p><b>38%</b></div><div><span>DK</span><p><strong>David Kim</strong><small>$372,800</small></p><b>29%</b></div><div><span>AM</span><p><strong>Alex Morgan</strong><small>$281,400</small></p><b>22%</b></div><div><span>LN</span><p><strong>Leah Nguyen</strong><small>$139,600</small></p><b>11%</b></div></div></article></div>
  <article className="panel report-library"><div className="panel-head"><div><h2>Report library</h2><p>Ready-to-use operational reports</p></div></div><div className="report-cards">{["Sales performance","Client health","Project delivery","Opportunity conversion"].map((x,i)=><button key={x} className={selectedReport===x?"selected":""} onClick={()=>setSelectedReport(x)}><span>R{i+1}</span><div><strong>{x}</strong><small>Updated today</small></div><b>-&gt;</b></button>)}</div></article><ReportDetail name={selectedReport} range={range}/></> }

function ReportDetail({name,range}:{name:string,range:string}) {
  const rows:Record<string,string[][]>={
    "Sales performance":[["Sarah Chen","$486,200","14 won","38%"],["David Kim","$372,800","11 won","29%"],["Alex Morgan","$281,400","8 won","22%"]],
    "Client health":[["Acme Industries","Active","92%","Low"],["Northstar Labs","Active","88%","Low"],["Mira Systems","At risk","61%","High"]],
    "Project delivery":[["Q3 platform rollout","72%","On schedule","Sep 12, 2026"],["Data consolidation","45%","On schedule","Oct 2, 2026"],["Customer portal","91%","Review","Aug 16, 2026"]],
    "Opportunity conversion":[["Qualified","42","$820k","100%"],["Proposal","24","$408k","57%"],["Negotiation","13","$264k","31%"],["Won","8","$184k","19%"]],
  };
  const headings=name==="Sales performance"?["Owner","Revenue","Deals","Win rate"]:name==="Client health"?["Client","Status","Health score","Risk"]:name==="Project delivery"?["Project","Progress","Delivery status","Due date"]:["Stage","Records","Value","Conversion"];
  return <article className="panel report-detail"><div className="panel-head"><div><h2>{name}</h2><p>{range} · Updated today</p></div><button className="secondary" onClick={()=>window.print()}>Print report</button></div><div className="table-scroll"><table><thead><tr>{headings.map(heading=><th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows[name].map((row,index)=><tr key={`${name}-${index}`}>{row.map(value=><td key={value}>{value}</td>)}</tr>)}</tbody></table></div></article>;
}

function Directory({announce,targetGroup}:{announce:(x:string)=>void,targetGroup:string}) {
  const groups=[
    {code:"RG",color:"blue",title:"Regions",count:3,detail:"Regional sales territories"},
    {code:"BR",color:"cyan",title:"Branches",count:3,detail:"Client-linked branch facilities"},
    {code:"EU",color:"purple",title:"End users",count:28,detail:"Referenced project owners"},
    {code:"CT",color:"green",title:"Account categories",count:4,detail:"Separate client and supplier classifications"},
    {code:"CO",color:"orange",title:"Countries & states",count:4,detail:"Address lookup tables"},
    {code:"EQ",color:"cyan",title:"Equipment",count:6,detail:"Commercial equipment lookup values"},
    {code:"SE",color:"red",title:"System settings",count:4,detail:"Application preferences"},
  ];
  const directoryRows:Record<string,string[][]>={
    Regions:[["RG-01","Central Region","Riyadh","Active"],["RG-02","Eastern Region","Dammam","Active"],["RG-03","Western Region","Jeddah","Active"]],
    Branches:[["BR-01","Riyadh Office","Central Region","Active"],["BR-02","Dammam Service Center","Eastern Region","Active"],["BR-03","Jeddah Branch","Western Region","Active"]],
    "End users":[["EU-028","Saudi Water Authority","Government","Active"],["EU-027","National Grid SA","Utilities","Active"],["EU-026","Maaden Operations","Industrial","Active"]],
    "Account categories":[["CAT-01","Client","Client records only","Active"],["CAT-02","Supplier","Supplier records only","Active"],["CAT-03","Consultant","External advisor","Active"],["CAT-04","Competitor","Market reference","Active"]],
    "Countries & states":[["SA-RI","Saudi Arabia","Riyadh","Active"],["SA-EP","Saudi Arabia","Eastern Province","Active"],["SA-MK","Saudi Arabia","Makkah","Active"],["AE-DU","United Arab Emirates","Dubai","Active"]],
    Equipment:[["EQ-001","Pumps","Mechanical","Active"],["EQ-002","Valves","Mechanical","Active"],["EQ-003","Control Panels","Electrical","Active"],["EQ-004","Instrumentation","Controls","Active"],["EQ-005","Water Treatment Package","Process","Active"],["EQ-006","Electrical Equipment","Electrical","Active"]],
    "System settings":[["SET-01","Default currency","SAR","Enabled"],["SET-02","Default user","Alex Morgan","Enabled"],["SET-03","Date format","DD/MM/YYYY","Enabled"],["SET-04","Notifications","On","Enabled"]],
  };
  const [activeGroup,setActiveGroup]=useState(()=>groups.find(group=>group.title===targetGroup)||groups[0]);
  const [selectedRow,setSelectedRow]=useState<string[]|null>(null);
  useEffect(()=>{const group=groups.find(item=>item.title===targetGroup);if(group){setActiveGroup(group);setSelectedRow(null)}},[targetGroup]);
  const rows=directoryRows[activeGroup.title]||[];
  return <><div className="source-note"><span>Access database</span><strong>Reference and lookup facilities</strong><small>Live prototype mapping</small></div><div className="directory-grid">{groups.map(g=><button key={g.title} className={activeGroup.title===g.title?"selected":""} onClick={()=>{setActiveGroup(g);setSelectedRow(null);announce(`${g.title} directory opened`)}}><span className={`directory-icon ${g.color}`}>{g.code}</span><div><small>{g.count} records</small><h2>{g.title}</h2><p>{g.detail}</p></div><b>-&gt;</b></button>)}</div><article className="panel directory-records"><div className="panel-head"><div><h2>{activeGroup.title}</h2><p>{activeGroup.detail}</p></div><button className="secondary" onClick={()=>announce(`New ${activeGroup.title} record form opened`)}>+ New record</button></div>{selectedRow?<fieldset><legend>{selectedRow[1]}</legend><div className="drawer-field-grid"><label>Record ID<input defaultValue={selectedRow[0]}/></label><label>Name<input defaultValue={selectedRow[1]}/></label><label>Value / Region<input defaultValue={selectedRow[2]}/></label><label>Status<select defaultValue={selectedRow[3]}><option>Active</option><option>Enabled</option><option>Inactive</option></select></label></div><div className="directory-actions"><button onClick={()=>setSelectedRow(null)}>Back to list</button><button onClick={()=>announce(`${activeGroup.title} information saved`)}>Save changes</button></div></fieldset>:<div className="table-scroll"><table><thead><tr><th>ID</th><th>Name</th><th>Value / Region</th><th>Status</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]} className="record-row" onClick={()=>setSelectedRow(row)}><td><span className="record-id">{row[0]}</span></td><td><strong>{row[1]}</strong></td><td>{row[2]}</td><td><Status value={row[3]}/></td></tr>)}</tbody></table></div>}</article></>;
}

const customerPages = [
  {name:"General",icon:"G",groups:[
    ["Identity",["Client Name","Client Name - Arabic","Client Number","Client Type","Handled by","FLAG"]],
    ["Contact",["Phone","Fax","Email","Website"]],
    ["Main address",["Address","City","Province","Postal Code","Country / Region"]],
    ["Registration & tax",["CR NO","CR DATE","CR VALIDITY","VAT NO","NATIONAL ADDRESS"]],
  ]},
  {name:"Contacts",icon:"C",groups:[["Client contacts",["First Name","Last Name","Full Name","Job Title","Department","Business Phone","Home Phone","Mobile Phone","Fax Number","E-mail Address","Category","Notes"]]]},
  {name:"Opportunities",icon:"O",groups:[
    ["Opportunity",["Project Name","Opportunity Type","Inquiry No / RFQ No","Inquiry Date","Inquiry Submission Date","Employee","Category","Rating","Consultant","End User"]],
    ["Commercial",["Supplier Name","Supplier Offer #","Supplier Offer Date","Supplier Offer Value","TPS Offer #","Offer Date","Currency","Offer Value","Scope of Work"]],
    ["Status & follow-up",["Project Status","Status of Call","Submitted","Last Call","Next Call","Comments"]],
  ]},
  {name:"Projects",icon:"P",groups:[]},
  {name:"Delivery",icon:"DL",groups:[]},
  {name:"Suppliers",icon:"SU",groups:[]},
  {name:"Activities",icon:"A",groups:[["Client activity",["Activity Type","Activity Date","Description","Notes","Attachments"]]]},
  {name:"Tasks",icon:"T",groups:[["Account task",["Title","Priority","Status","% Complete","Assigned To","Description","Start Date","Due Date","Completed Date","Attachments"]]]},
  {name:"Documents",icon:"D",groups:[
    ["Company documents",["Client LOGO","CR COPY","VAT COPY","NATIONAL ADDRESS"]],
    ["Commercial attachments",["Pricing Sheet","Supplier Offer Attachment","Offer Attachment","Other Attachments"]],
    ["Billing address",["Billing Street","Billing City","Billing Postal","Billing Country"]],
    ["Shipping address",["Shipping Street","Shipping City","Shipping Postal","Shipping Country"]],
  ]},
];

const accessPages = [
  {name:"Client List",source:"Accounts",count:338,icon:"CU",color:"purple",groups:[
    ["Identity",["AccountID","Account Name","Account Name - Arabic","Account Number","Account Type","Category","Handled by","FLAG"]],
    ["Contact",["Phone","Mobile Phone","Fax","Email","Website"]],
    ["Main address",["Address","City","Province","Postal Code","Country / Region"]],
    ["Billing address",["Billing Street","Billing City","Billing Postal","Billing Country"]],
    ["Shipping address",["Shipping Street","Shipping City","Shipping Postal","Shipping Country"]],
    ["Follow-up",["Call Status","Call Date / Visit Date","Next Call / Next Visit","Comments","Notes","Attachments"]],
    ["Registration & tax",["CR NO","CR DATE","CR VALIDITY","CR COPY","VAT NO","VAT COPY","NATIONAL ADDRESS"]],
    ["Commercial",["Supplier Scope","Scope of work","Client LOGO"]],
  ]},
  {name:"Contact Details",source:"Contacts Extended",count:986,icon:"CO",color:"cyan",groups:[
    ["General",["ContactID","First Name","Last Name","Full Name","Company","Job Title","Department","Project Name","Category","FLAG"]],
    ["Phone numbers",["Business Phone","Home Phone","Mobile Phone","Fax Number"]],
    ["Address",["Street","City","Province","ZIP / Postal Code","Country / Region"]],
    ["Online & notes",["E-mail Address","Web Page","Notes","Attachments"]],
  ]},
  {name:"Maintain Offers",source:"Opportunities Extended",count:171,icon:"OP",color:"green",groups:[
    ["Inquiry",["OpportunityID","Document Type","Inquiry No / RFQ No","Scope Note","Inquiry Date","Inquiry Submission Date","Submitted","Project Name","Opportunity Type","Year"]],
    ["Client",["Client","Contact Person","Telephone","Region","Location","Consultant","End User","Client Inquiry Status"]],
    ["Ownership & status",["Employee","How Found Type","Closed","Status of Call","Last Call Date","Next Call Date","Proposal Status","Client Project Status"]],
    ["Supplier offer",["Principle / Supplier Name","Supplier Offer #","Supplier Offer Date","Supplier Validity Date","Supplier Offer Value","Supplier Total","Supplier Offer Attachment"]],
    ["TPS offer",["Offer #","Offer Date","Offer Validity Date","Submittal Date","TPS Offer","Currency","Offer Attachment","Pricing Sheet","Scope of Work","Equipment"]],
    ["Client order",["Client Order No","Client Order Date","Order Value","Client Delivery Date","SO No","Client PO","TPS Order","TPS Order Date"]],
    ["Terms",["Payment Terms","Delivery Terms","Delay Penalty","Leakage Test","Supervision on Installation","Insurance","Project Milestone & Payments"]],
    ["Costs",["Shipping","Packing & Loading","Installation","L/C Cost","Financing","Customs","Saber","Clearance","Transportation","Other Expenses","Total Expenses"]],
    ["Pricing & margin",["Margin","Margin %","Negotiation","Negotiation %","Total Margin","Total Cost","Total Price","VAT","Total with VAT","Total Profit","Profit"]],
    ["Logistics",["No. of Trucks","Truck Type","Truck Fees","Total Truck Cost","Supervision","Late Delivery"]],
    ["History & documents",["Comments","Comment Date","History","Notes","Email","Attachments"]],
  ]},
  {name:"Daily Tasks",source:"Opportunities Extended-99",count:171,icon:"TS",color:"yellow",groups:[
    ["Daily update",["Project Name","Task Type","Client","Employee","Project Status","Opportunity Stage","Done","Last Call","Next Call","Call Again"]],
    ["Inquiry & offer",["RFQ No","Inquiry Date","Principle Offer #","Principle Offer Date","TPS Offer #","TPS Offer Date","Submission Date","Offer Value"]],
    ["Project parties",["Principle Name","Consultant","End User","Contact Name","Mobile #","Region","Location"]],
    ["Notes",["Project Scope","Comments","Notes","Attachments"]],
  ]},
  {name:"Project Status",source:"Projects / Opportunities",count:66,icon:"PR",color:"pink",groups:[
    ["Project",["ProjectID","Project Name","Client","Project Type","Start Date","End Date","Estimated End Date","Delay","Actual Revenue","Currency"]],
    ["Offer tracking",["RFQ No","Project Status","Opportunity Stage","Principle Name","Principle Offer #","TPS Offer #","Offer Date","Next Call","End User","Consultant"]],
    ["Delivery",["Client PO","SO No","Delivery Terms","Project Milestone & Payments","Scope of Work","Notes","Attachments"]],
  ]},
  {name:"Supplier List",source:"Suppliers Extended",count:73,icon:"SU",color:"teal",groups:[
    ["Supplier",["Supplier ID","Supplier Name","Account Number","Account Type","Supplier Scope","Phone","Mobile Phone","Fax","Email","Website"]],
    ["Address",["Address","City","Province","Postal Code","Country / Region","Delivery Address","Delivery City","Delivery Province","Delivery Postal","Delivery Country"]],
    ["Follow-up",["Call Status","Call Date","Next Call","Notes","Attachments"]],
  ]},
  {name:"Activity Details",source:"Activities Extended",count:1,icon:"AC",color:"magenta",groups:[
    ["General",["ActivityID","Company","Activity Type","Activity Date","Description"]], ["Notes & files",["Notes","Attachments"]],
  ]},
  {name:"Employee Details",source:"Employees Extended",count:1,icon:"EM",color:"indigo",groups:[
    ["General",["Employee ID","First Name","Last Name","Company","Job Title","E-mail Address","Web Page"]],
    ["Phone numbers",["Business Phone","Home Phone","Mobile Phone","Fax Number"]],
    ["Address",["Street","City","State / Province","ZIP / Postal Code","Country / Region"]],
    ["Notes & files",["Notes","Attachments"]],
  ]},
  {name:"End Users",source:"END USERS",count:28,icon:"EU",color:"orange",groups:[["End user",["ID","END USER"]]]},
  {name:"Reports",source:"Access Reports",count:10,icon:"RP",color:"red",groups:[
    ["Client & contact",["Client Listing","Clients","Contact Phone Book","Contact Directory"]],
    ["Employees",["Employee Address Book","Employee Phone Book"]],
    ["Opportunities",["Opportunities by Suppliers","Opportunities by Accounts","Opportunities by Date","Opportunities Extended"]],
  ]},
];
