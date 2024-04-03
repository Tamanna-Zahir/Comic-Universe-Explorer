const express = require("express");
const mysql = require('mysql');
const app = express();
const pool = dbConnection();

app.set("view engine", "ejs");
app.use(express.static("public"));
//to parse Form data sent using POST method
app.use(express.urlencoded({extended: true}));

//routes
app.get('/',async (req, res) => {
    let sql = `SELECT *
              FROM fe_comic_sites`;
  let sql2 = `SELECT * 
              FROM fe_comics 
              Natural join fe_comic_sites
            
              ORDER BY RAND() LIMIT 1`;
  let rows2 = await executeSQL(sql2);
  let rows = await executeSQL(sql);
  // console.log("test", rows2)
   res.render('home', {"sites":rows, "random":rows2[0]});
});
app.get('/api/comic',async (req, res) => {
    
  let sql2 = `SELECT * 
              FROM fe_comics 
              Natural join fe_comic_sites
              ORDER BY RAND() LIMIT 1`;
  let rows2 = await executeSQL(sql2);

  res.send(rows2);
});
app.get('/api/comment/:comicId', async (req, res) => {
  //we req.query to get data from "Form"
  let comicId = req.params.comicId;
  console.log("test")
  let sql = `SELECT *
             FROM fe_comments WHERE comicId = ?`
  let params = [comicId];
  let row = await executeSQL(sql,params)
  res.send(row);
  }); 
app.get('/addComic', async (req, res) => {
  let sql = `SELECT *
              FROM fe_comic_sites`;
  let rows = await executeSQL(sql);
 res.render('addComic', {"sites":rows});
});

app.post('/addComic', async(req, res) => {
  let comicTitle = req.body.comicTitle;
  let url = req.body.comicUrl;
  let date = req.body.comicDate;
  let site = req.body.site;
  console.log(site)
  let sql = `INSERT INTO fe_comics (comicUrl, comicTitle,  comicDate, 
              comicSiteId ) VALUES(?,?,?,?)`;
  let params = [url, comicTitle, date, site];
  let comic = await executeSQL(sql, params);
 res.redirect('addComic')
});

app.get('/comicPage/:comicSiteId', async(req, res) => {
  let comicSiteId = req.params.comicSiteId;
  let sql = `SELECT *
              FROM fe_comics
              WHERE comicSiteId = ?`;
  let sql2 = `SELECT comicSiteName
            FROM fe_comic_sites
            Natural join fe_comics
            WHERE comicSiteId = ?`;
  let name = await executeSQL(sql2, [comicSiteId]);
  let rows = await executeSQL(sql, [comicSiteId]);
  
  // console.log(name)
 // res.render('comicPage', {"comics": rows, "name": name[0].comicSiteName})
res.render('comicPage', {"comics": rows, "name": name && name[0] ? name[0].comicSiteName : ''})
});

app.get('/addComment/:comicId', async (req, res) => {
  let comicId = req.params.comicId;
  let sql = `SELECT *
              FROM fe_comics
              WHERE comicId = ?`; 
  let rows = await executeSQL(sql, [comicId]);
  console.log(rows)
 res.render('addComment', {"name" : rows[0]})
});
app.post('/addComment',async (req, res) => {
    let userName = req.body.userName;
    let emailAddress = req.body.emailAddress;
    let comment = req.body.comment;
    let comicId = req.body.id;
    console.log(comicId)
    let sql = `INSERT INTO fe_comments (author, email, comment, comicId) VALUES(?,?,?,?)`;
    let params = [userName, emailAddress, comment,comicId];
   let comic = await executeSQL(sql, params);
   res.redirect('/');
});


app.get('/rubric', (req, res) => {
 res.render('rubric')
});
app.get('/viewComment/:comicId', async (req, res) => {
  let ComicId = req.params.comicId;
  let sql = `SELECT * 
              FROM fe_comments
              Natural join fe_comics
              WHERE comicId = ?`;
  let params = [ComicId];
  let rows = await executeSQL(sql, params);
  console.log(rows)
 res.render('viewComments', {"comments": rows})
});
app.get('/deleteComment/:commentId/:comicId', async (req, res) => {
  let commentId = req.params.commentId;
  let comicId = req.params.comicId;
  let sql =`DELETE FROM fe_comments
            WHERE commentId = ?`;
  let params = [commentId];
  console.log(params)

  let rows = await executeSQL(sql, params);
 res.redirect('/viewComment/'+comicId)
});
app.get('/updateComment/:commentId/:comicId', async (req, res) => {
  console.log("tesssssss")

  let commentId = req.params.commentId;
  let comicId = req.params.comicId;
  let sql =`SELECT * 
            FROM fe_comments 
            NAUTRAL JOIN fe_comics
            WHERE commentId = ? `;
  let params = [commentId];
  console.log(params)


  let rows = await executeSQL(sql, params);
 res.render('updateComment', {"comment": rows[0], "comicId": comicId})
});



app.post('/updateComment/:commentId/:comicId', async (req, res) => {
  let comicId = req.params.comicId;
  let commentId = req.params.commentId;
  let author = req.body.author;
  let email = req.body.email;
  let comment = req.body.comment;
  console.log("commentId",commentId)
  console.log(author)
  console.log(email)
  console.log(comicId)

  let sql = `UPDATE fe_comments
            SET author = ?, email = ?, comment = ?
            WHERE commentId = ?`;
  let params = [ author, email, comment, commentId];
  console.log(params)
  let rows = await executeSQL(sql, params);
 res.redirect('/viewComment/'+comicId)
});
app.get("/dbTest", async function(req, res){
let sql = "SELECT CURDATE()";
let rows = await executeSQL(sql);
res.send(rows);
});//dbTest

//functions
async function executeSQL(sql, params){
return new Promise (function (resolve, reject) {
pool.query(sql, params, function (err, rows, fields) {
if (err) throw err;
   resolve(rows);
});
});
}//executeSQL
//values in red must be updated
function dbConnection(){

   const pool  = mysql.createPool({

      connectionLimit: 10,
      host: "grp6m5lz95d9exiz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
      user: "k0p3x6slkgsmnals",
      password: "gi9ijhe674839thg",
      database: "uk8foucrkunm8gyk"

   }); 

   return pool;

} //dbConnection

//start server
app.listen(3000, () => {
console.log("Expresss server running...")
} )
