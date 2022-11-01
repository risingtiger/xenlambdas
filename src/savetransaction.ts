

type str = string;
type int = number;
//type bool = boolean;

import { QuerySnapshot }  from "firebase-admin/firestore";



const SaveTransaction = async (db:any, date:str, str: str, sourceI:str, _cb=()=>{}) => {

  return new Promise((res, rej)=> {

    let datain = _SaveTransaction_parse(str)

    if (datain.er) { 
      rej("unable to parse")
      return false
    }

    let tagsSplit = datain.tags ? datain.tags.split("-").map((m:any)=> m.trim()) : []
    
    const catsPromise    = db.collection("cat").get()
    const sourcesPromise = db.collection("source").get()
    const tagsPromise    = db.collection("tag").get()

    Promise.all([catsPromise, sourcesPromise, tagsPromise])
      .then((snapshots:QuerySnapshot[])=> {
        const catsAll:any = []
        const sourcesAll:any = []
        const tagsAll:any = []

        snapshots[0].forEach((doc:any)=> { catsAll.push({ id: doc.id, ...(doc.data()) });})
        snapshots[1].forEach((doc:any)=> { sourcesAll.push({ id: doc.id, ...(doc.data()) });})
        snapshots[2].forEach((doc:any)=> { tagsAll.push({ id: doc.id, ...(doc.data()) });})

        let ts = Math.round( (new Date(date)).getTime() / 1000)
        let merchant = datain.merchant
        let cat = catsAll.find((c:any)=> c.name === datain.cat)
        let source = sourcesAll.find((s:any)=> s.name === sourceI)
        let tags = tagsAll.filter((t:any)=> tagsSplit.includes(t.name))
        let amount = datain.amount
        let notes = datain.notes || ''

        if (!ts || !merchant || !cat || !source || isNaN(amount)) {
          console.log("done fucked up")
          rej('done fucked up')
        }

        else {
          let tagsArray = tags.map((t:any)=> db.doc(`tag/${t.id}`))

          let transactionSaveData:any = {   ts, merchant, cat: db.doc(`cat/${cat.id}`), tags: tagsArray, source: db.doc(`source/${source.id}`), amount, notes     }
          
          const batch = db.batch();

          const newref = db.collection("transaction").doc()

          batch.set(newref, transactionSaveData)

          batch.commit().then(() => {
            console.log("batch write commited")
            res(1)

          }).catch(() => {
            console.log("done fucked up on the batch commit")
            rej("bonked out on firestore save")
          })
        }
      })
  })
} 




function _SaveTransaction_parse(str:str) {
  let matchMain = str.match(/I spent \$([0-9]+) at ([a-z' ]+) for ([a-z]+)/i)
  let matchNote = str.match(/, ([a-z0-9 ]+)/i)

  let datain:any = {
    tags:null,
  }

  if (matchMain) {
    datain.amount = Number(matchMain[1]) 
    datain.merchant = matchMain[2] 
    datain.cat = matchMain[3] 

    if (matchNote) {
      datain.notes = matchNote[1] 
    }

  } else {
    datain.er = true
  }

  return datain
}









export { SaveTransaction };




