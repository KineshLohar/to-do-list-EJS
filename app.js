
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs'); 


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

const itemSchema = {
    name: String
};

const listSchema = {
    name: String,
    items : [itemSchema]
}

const List = new mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name: "Get Food"});
const item2 = new Item({name: "Cook Food"});
const item3 = new Item({name: "Eat Food"});

const defaultItems = [item1, item2, item3];


app.get('/', function(req, res){
   
    // var today = new Date();
    // var options = {
    //     weekday: "long",
    //     day : "numeric",
    //     month : "long",
    //     year : "numeric",
    //     // hour : "numeric",
    //     // minute : "numeric",
    //     // second : "numeric"
    // }
    // var day = today.toLocaleDateString("en-US", options);

    
    Item.find().then(function(items){

        if(items.length === 0){
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully saved default items to DB");
              }).catch(function (err) {
                console.log(err);
              });  
              res.redirect("/");
        }
        else{
            res.render("list", {listTitle: "Today",newListItems : items });
        }  
    });
});

app.post("/", function(req,res){
    const itemName = req.body.Item;
    const listName = req.body.list;

    if (itemName === null || itemName.trim() === "" ){
        
        if(listName === "Today"){
            res.redirect("/");
        } else {
            res.redirect("/"+listName);
        }
    }
    else {
        const item = new Item({name:itemName});

        if(listName === "Today"){
            item.save();
            res.redirect("/");
        } else {
            List.findOne({name: listName}).then(function(foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
        }

    } 
})

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function (){
            console.log("Deleted sucess");
            res.redirect("/");
        }).catch(function(err){
            console.log(err);
        }) ;
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}).then(function(foundItem){
            console.log(foundItem.items.name + "Deleted successfully from " + listName);
            res.redirect("/"+listName);
        }).catch(function(err){
            console.log(err);
        })
    }

   
   
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList){
           //create a new list
            const list = new List({
                name : customListName,
                items : defaultItems
            });
            list.save();
           res.redirect("/"+ customListName);
        } else {
         // show existing list
         res.render("list", {listTitle : foundList.name, newListItems: foundList.items});
        }
    })
})

app.listen(3000, function(){
    console.log("Server started");
});