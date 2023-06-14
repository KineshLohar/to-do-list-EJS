
const express = require("express");
const bodyParser = require("body-parser");


const app = express();

var items = [];
let workItems =[];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs'); 


app.get('/', function(req, res){
   
    var today = new Date();
    var options = {
        weekday: "long",
        day : "numeric",
        month : "long",
        year : "numeric",
        // hour : "numeric",
        // minute : "numeric",
        // second : "numeric"
    }

    var day = today.toLocaleDateString("en-US", options);

    res.render("list", {listTitle: "Home",
        newListItems : items
    });

});

app.post("/", function(req,res){
    var item = req.body.Item;

    if (req.body.list === "Work"){
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
    
})

app.get("/work", function(req, res){
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.post("/work", function(req, res){

    let item = req.body.Item;
    workItems.push(item);
    res.redirect("/work");
})

app.listen(3000, function(){
    console.log("Server started");
});