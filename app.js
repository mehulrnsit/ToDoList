//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin_mehul:mehulsvps@cluster0.7gsgn.mongodb.net/toDoListDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchem = {
  name : String
};

const Item = mongoose.model("Item", itemsSchem);

const item1 = new Item ({
  name: "Eat"
});

const item2 = new Item({
  name: "Sleep"
});

const item3 = new Item({
  name: "Repeat"
});

const listSchema = {
  name: String,
  items: [itemsSchem]
};

const List = mongoose.model("List",listSchema);


const defaultItems = [item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){

    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
          console.log(err);
        else  
          console.log("Successfully inserted to the database");
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    

  });
});

app.get("/:customListName",function(req,res){

  const customListName=  _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList){
        //create a new list
        //console.log("new");
        const list = new List({
          name : customListName,
          items: defaultItems
        });
        list.save(function() {
          res.redirect("/"+customListName);
      });
      }
       
      else{
        //show the existing list
        //console.log(foundList);
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
       
    }
  });
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName  = req.body.list;
  const item = new Item({
    name: itemName
  });
  
if (listName === "Today") {
  item.save();
  res.redirect('/');
} else {
  List.findOne({
    name: listName
  }, function(err, foundList) {
    if (!foundList) {
      console.log("List not found")
    } else {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
  });
}
  // if(listName === "Today"){
  //   item.save();
  //   res.redirect("/");
  // }
  // else{
  //     List.findOne({name: listName}, function (err, foundList){
  //       // foundList.items.push(item);
  //       let x = foundList.items;
  //       x.push(item);
  //       foundList.save();
  //       res.redirect("/"+listName);
  //   });


});

app.post("/delete",function(req,res){
const checkedItemId =  req.body.checkbox;
const listName = req.body.listName;

if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err)
    {
      console.log(err);
    }
    else
      console.log("successfullt deleted the item that was checked");
      res.redirect("/");
  });

}else{
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function (err, foundList){
    if(!err){
        res.redirect("/"+listName);
    }
});

}

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
