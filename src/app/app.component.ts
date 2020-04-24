import { Component,OnInit, ViewChild, ElementRef } from '@angular/core';
import * as faceapi from 'face-api.js';
import { async } from '@angular/core/testing';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
labeledPhoto;
faceMatcher;
label="";
score = 0.6;
distanceMatcher = 0.7;
inputSize = 320;
showCam = false;
imageSrc = '';
@ViewChild('faceCheck', { static: true }) faceCheck: ElementRef;
@ViewChild('overlay1',{static:true}) overlay1:ElementRef;
  ngOnInit(){
    this.loadModels().then(()=>{this.load()});
  } 
  async load(){
    this.labeledPhoto = await this.loadLabeledImages();
    this.start();
    this.showCam = true;
  }
  start(){
    this.faceMatcher = new faceapi.FaceMatcher(this.labeledPhoto, this.distanceMatcher);
  }
  async loadModels(){
    let dirpath ='assets/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(dirpath);
    await faceapi.nets.faceRecognitionNet.loadFromUri(dirpath);
    await faceapi.nets.faceLandmark68Net.loadFromUri(dirpath);
  }
  detect(e){
    this.imageSrc = e;
    setTimeout(async()=>{
      this.rec();
  },10)
  }
  async rec(){
    const detections = await faceapi.detectSingleFace(this.faceCheck.nativeElement,new faceapi.TinyFaceDetectorOptions({inputSize:this.inputSize,scoreThreshold:this.score})).withFaceLandmarks().withFaceDescriptor();
    if(detections){
    let result =  this.faceMatcher.findBestMatch(detections.descriptor);
    if(result){
      this.label = result.label;
      setTimeout(()=>{
        this.label= '';
      },100);
    }
    const displaySize = { width: this.faceCheck.nativeElement.width, height: this.faceCheck.nativeElement.height }
// resize the overlay canvas to the input dimensions
faceapi.matchDimensions(this.overlay1.nativeElement, displaySize)

/* Display detected face bounding boxes */
// resize the detected boxes in case your displayed image has a different size than the original
const resizedDetections = faceapi.resizeResults(detections, displaySize)
// draw detections into the canvas
faceapi.draw.drawDetections(this.overlay1.nativeElement, resizedDetections)

  }
  else{
    console.log('fail');
  }
  }
  loadLabeledImages() {
    const labels = ['Sample'];
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 4; i++) {
          const img = await faceapi.fetchImage(`assets/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
          if(detections){
          descriptions.push(detections.descriptor);
          }
        }
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }
  testMatcher(i){
    this.distanceMatcher = i*0.1;
    this.start();
    if(!this.showCam){
      this.rec();
    }
    
  }
  testScore(i){
    this.score = i*0.1;
    this.start();
    if(!this.showCam){
      this.rec();
    }
  
}
testInput(i){
    this.inputSize = i*32;
    this.start();
    if(!this.showCam){
      this.rec();
    }
}
stopCam(){
  this.showCam = !this.showCam;
  if(!this.showCam){
    this.faceCheck.nativeElement.style.display = 'block';
  }
  else{
    this.faceCheck.nativeElement.style.display = 'none';
  }
}
}
