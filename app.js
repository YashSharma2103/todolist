const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose")
const _=require("lodash");
const app=express();
mongoose.connect('mongodb+srv://yash2003:yash2103@yash.p71t17t.mongodb.net/todolistDB', {useNewUrlParser: true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))


const itemSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,"no new item added"]
  }
});

const Item=mongoose.model("item",itemSchema);

const item1=new Item({
  name:"Welcome to todo list"
});

const item2=new Item({
  name:"Use + to add new item"
});

const item3=new Item({
  name:"use this checkbox to delete item"
});

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List=mongoose.model("list",listSchema);

var today=new Date();
var options={
  weekday:"long",
  day:"numeric",
  month:"long"
};
var day=today.toLocaleDateString("en-US",options);

app.get("/",function(req,res)
{
  Item.find({})
  .then(function(items)
  {
    if(items.length===0){
      Item.insertMany(defaultItems)
      .then(()=>console.log("Successfully inserted"))
      .catch((err)=>console.log(err));
      res.redirect("/");
    }
    else{
      res.render("list",{kindOfDay:day,ListTitle:"",newListItem:items});
    }
    
  })
  .catch((err)=>console.log(err));
});

app.get("/:customListName",function(req,res){

  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then(function(foundList){
    if(!foundList){
      console.log("list doesn't exits, created one");
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      console.log("list exist");
      res.render("list",{kindOfDay:day,ListTitle:foundList.name,newListItem:foundList.items});
    }
  })
  .catch((err)=>console.log(err));

});

app.post("/",function(req,res,err){
  var item=req.body.listItem;
  var listName=req.body.list;
  console.log(listName);
  const newItem=new Item({
    name:item
  });

  if(listName===""){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
    .catch((err)=>console.log(err));
  }
  
});

app.post("/delete",function(req,res){
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;
  console.log(listName);
  if(listName===""){
    Item.findByIdAndDelete(checkedId)
    .then(console.log("deleted Successfully"))
    .catch((err)=>console.log(err));
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}})
    .then(console.log("deleted Successfully"))
    .catch((err)=>console.log(err));
    res.redirect("/"+listName);
  };
});

/*
let port=process.env.PORT;
if(port===null||port===""){
  port="3000"
}
*/
app.listen(3000,()=>
{
  console.log("server is running");
});