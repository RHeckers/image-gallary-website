     const express = require('express');
const multer = require('multer');
const router = express.Router();
const ArtCollection = require('../models/artCollection');
const checkAuth = require('../middleware/check-auth');
const fs = require('fs');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
}

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Inlavid image type');
        if(isValid){
            error = null;
        }
        cb(error, "backend/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extention = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + extention);
    }
});

router.post('/addImages', checkAuth, multer({storage: fileStorage}).array("images"), (req, res, next) => {
    console.log(req.files);
    const url = req.protocol + "://" + req.get("host");
    const imgPaths = []
    for(let i = 0; i < req.files.length; i++){
        imgPaths.push(url + "/images/" + req.files[i].filename);
    }
    res.status(201).json(imgPaths)

    .catch(err => console.log(err));
    
});

router.post('/', checkAuth, multer({storage: fileStorage}).array("images"), (req, res, next) => {
    console.log(req.files);
    const url = req.protocol + "://" + req.get("host");
    const imgPaths = []
    for(let i = 0; i < req.files.length; i++){
        imgPaths.push(url + "/images/" + req.files[i].filename);
    }
    const artcollection = new ArtCollection({
        title: req.body.title,
        description: req.body.description,
        artCollection: imgPaths
    });
    console.log(artcollection);
    artcollection.save().then(createdCollection => {
        res.status(201).json({
            ...createdCollection,
            id: createdCollection._id
        });
    })
    .catch(err => console.log(err));

});


router.get('/',(req, res, next) => {
    ArtCollection.find().sort({index: 1})
      .then(collections => {
          res.status(200).json(collections);
      });
});



router.put('/:id', checkAuth, (req, res, next) => {
    let newCollection = req.body.artCollection;

    const newCollectionObj = new ArtCollection({
            _id: req.body.id,
            title: req.body.title,
            description: req.body.description,
            artCollection: newCollection
    })
    // console.log(newCollection);
    //Delete files from backend  
    ArtCollection.findOne({_id: req.params.id}) 
    .then(doc => {
        doc['artCollection'].forEach(filename => {
               if(!newCollection.includes(filename)){
                var filepath =  "backend/" + filename.split("http://localhost:3000/")[1];
                if (fs.existsSync(filepath)) {  

                    fs.unlink(filepath, (error) => {
                        if (error) {
                            console.log(error)
                            res.status(400).json({ msg: 'Something went wrong deleting the images!'})
                        };
                        console.log('Deleted filename', filepath);
                    });
                }
                else{console.log(filepath + 'file does not exist') }

            }
        });
        return req.params.id;
    })
    .then(id=> {
    ArtCollection.updateOne({_id: id}, newCollectionObj)
        .then(result => {
            console.log(result)
            res.status(200).json({msg: 'Post Updated!'})
        })
            
})
.catch(err => console.log(err));
});


router.delete('/:id', checkAuth, (req, res, next) => {
    //delete image file in backend
    ArtCollection.findOne({_id: req.params.id})
    .then(doc => {
        doc['artCollection'].forEach(filename => {           
            var filepath =  "backend/" + filename.split("http://localhost:3000/")[1];
            if (fs.existsSync(filepath)) {              
            fs.unlink(filepath, (error) => {
                if (error) {
                    console.log(error)
                    res.status(400).json({ msg: 'Something went wrong deleting the images!'})
                }
                console.log('Deleted filename', filepath);
            });
              //file exists
            }
            else{console.log(filepath + 'file does not exist') }
        });
        return req.params.id
    })               
   .then(result =>{
    //delete image in mongodb
    ArtCollection.deleteOne({_id: result})
    .then(result => {
      console.log('Collection deleted');
      res.status(200).json({msg: "Collection deleted!"})
    });
}).catch(err => res.status(400).json({ msg: 'Something went wrong deleting the collection!'}));;

});

        
   
    
    

module.exports = router;