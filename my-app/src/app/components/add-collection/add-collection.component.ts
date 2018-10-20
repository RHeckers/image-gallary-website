import { Component, OnInit } from '@angular/core';
import { ArtCollectionService } from '../../services/art-collection.service';
import { ImageSwapComponent } from '../image-swap/image-swap.component';

@Component({
  selector: 'app-add-collection',
  templateUrl: './add-collection.component.html',
  styleUrls: ['./add-collection.component.css']
})
export class AddCollectionComponent implements OnInit {

  collectionTitle: string;
  dragedImgOffset: number;
  imgHolder: HTMLElement;
  imgInput: HTMLElement;
  images: NodeList;
  imagePreviews: Array<any> = [];
  previewFiles: Array<File> = [];
  imgSwap: ImageSwapComponent;

  constructor(private artCollectionService: ArtCollectionService) {
    this.imgSwap = new ImageSwapComponent()
   }

  ngOnInit() {
    document.getElementById('footer').style.display = 'none';
    this.imgInput = document.getElementById('imgInput');
    this.imgHolder = document.getElementById('previewImages');
  }

  addCollection(){
    this.artCollectionService.addArtCollection(this.collectionTitle, this.previewFiles);
  }

  uploadImg(e){
    const uploadedImges = e.target.files;
  
    for(let i = 0; i < uploadedImges.length; i++){
      let uploadedImg = uploadedImges[i];
      this.previewFiles.push(uploadedImg);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result) ;
      };
      reader.readAsDataURL(uploadedImg);
    }
  }

  swapImg(e){
    let swapArrIndexes = this.imgSwap.dropImg(e, this.imgHolder);
    this.setNewPosFileArray(this.previewFiles, swapArrIndexes[0], swapArrIndexes[1]);    
  }

  setNewPosFileArray(arr, from, to) {
    let cutOut = arr.splice(from, 1) [0];
    arr.splice(to, 0, cutOut); 
    console.log(arr);
    return arr;
  };


}
