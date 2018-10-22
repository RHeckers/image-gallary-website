import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalServiceService {

  constructor() { }

  //Switch possition in array
  setNewPosFileArray(arr, from, to) {
    let cutOut = arr.splice(from, 1) [0];
    arr.splice(to, 0, cutOut); 
    return arr;
  };

  //Insert error message
  insertError(msg, insertAfter){
    let error = document.createElement('p');
    error.className = 'errorMsg';
    error.innerHTML = msg;
    insertAfter.parentNode.insertBefore(error, insertAfter.nextSibling);
    setTimeout(() => {
      error.remove();
    }, 3000);
  }
}
