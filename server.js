const express = require('express')
const app = express()
const port = 3000

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended:true})) 

const { MongoClient } = require("mongodb");
const { ObjectId } = require('mongodb');

let db
const url = 'mongodb+srv://jiho9380:mongodb@cluster0.ir3hcfu.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  console.log('DB connecting success')
  db = client.db('forum')
  db2 = client.db('sample_training')
  forum = client.db('forum')

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}).catch((err)=>{
  console.log(err)
})


//1-practice

app.get('/', (req, res) => {
  res.send('반갑다')
})

app.get('/csstest', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/dbtest', (req, res) => {
  db.collection('post').insertOne({title: 'this is title'})
  res.send('db입력완료!')
})

app.post('/add', (req, res) => {
  console.log(req.body)
})

app.get('/dblist', async(req, res) => {
  let result = await db.collection('post').find().toArray()
  res.send(result[0].title)
})

app.get('/printall', async(req, res) => {
  let result = await db.collection('post').find().toArray()
  res.render('printall.ejs', {posts: result})
})

app.get('/time', async(req, res) => {
  let result = await db.collection('post').find().toArray()
  res.render('time.ejs', {time : new Date()})
})

//2 - board practice

app.get('/list/:id', async(req, res) => {
  let result = await db2.collection('companies').find().skip((req.params.id -1)*10).limit(10).toArray()
  // let result = await db2.collection('companies').find({_id : {$gt : new ObjectId(req.params.id) }}).limit(10)
  res.render('list.ejs', {posts: result})
})

app.get('/no-pagination', async(req, res) => {
  let result = await db2.collection('companies').find().toArray()
  res.render('no-pagination.ejs', {posts: result})
})

app.get('/detail/:id', async(req, res) => {
  try {
    let result = await db2.collection('companies').findOne({_id : new ObjectId(req.params.id)})
    if (result == null) {
      res.status(400).send('no post found')
    } else {
      res.render('detail.ejs', {posts : result})
    }
  } catch(error){
    res.send('error')
  }
})

app.get('/write', (req, res) => {
  res.render('write.ejs')
})

app.get('/edit/:id', async(req, res) => {
  try {
    let result = await db2.collection('companies').findOne({_id : new ObjectId(req.params.id)})
    if (result == null) {
      res.status(400).send('no post found')
    } else {
      res.render('edit.ejs', {posts : result})
    }
  } catch(error){
    res.send('error')
  }
})

app.post('/edit', async(req, res) => {
  await db2.collection('companies').updateOne({_id : new ObjectId(req.body.id)}, 
  {$set : {founded_year: req.body.founded_year, founded_month: req.body.founded_month, founded_day: req.body.founded_day}})
  res.redirect('/list/1')
})

app.delete('/delete', async(req, res) => {
  await db2.collection('companies').deleteOne({ _id : new ObjectId(req.query.docid)})
  res.send('deleted!')
})


//3. board practice2

app.get('/list2', async(req, res)=>{
  let result = await forum.collection('post').find().toArray()
  res.render('list2.ejs', { posts : result })
})

app.get('/detail2/:id', async(req, res)=>{
  let result = await db.collection('post').findOne({_id : new ObjectId(req.params.id)})
  res.render('detail2.ejs', {posts: result})
})

app.get('/edit2/:id', async(req, res)=> {
  let result = await db.collection('post').findOne({_id : new ObjectId(req.params.id)})
  res.render('edit2.ejs', {posts: result})
})

app.post('/edit2', async(req, res) => {
  await db.collection('post').updateOne({_id : new ObjectId(req.body.id)}, 
  {$set : {title: req.body.title, content: req.body.content}})
  res.redirect(`/detail2/${req.body.id}`)
})

app.get('/write2', async(req, res)=> {
  res.render('write2.ejs')
})

app.post('/write2', async(req, res) => {
  await db.collection('post').insertOne({title:req.body.title, content:req.body.content})
  res.redirect('/list2')
})

app.delete('/delete2', async(req, res) => {
  await db.collection('post').deleteOne({ _id : new ObjectId(req.query.docid)})
})