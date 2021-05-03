import * as tf from '@tensorflow/tfjs';
import word_index from './assets/model/word_index.js';
import first_word from './assets/model/first_word.js';
import reverse_word_index from './assets/model/reverse_word_index.js';

export default class App {

    constructor()
    {
        this.temperature = 0.2;
        this.sequence_length = 99;
        this.text = "";
        console.info('TensorFlow.Js version', tf.version['tfjs'])
        this.generateButton = document.getElementById("generate-button");
        this.generateButton.disabled = true;
        this.generatedText = document.getElementById("generated-text");
        this.generateButton.onclick = () => {
            this.disableGeneration();
            this.generateText();
            this.format_text();
            this.generatedText.innerText = `"${this.text}"`;
            this.enableGeneration();
        }
        tf.loadLayersModel("./assets/model/model.json").then( (model) => {
            this.model = model;
            this.enableGeneration();
        })
        
    }

    enableGeneration() {
        this.generateButton.innerText = "Generate new text";
        this.generateButton.disabled = false;
    }

    disableGeneration(){
        this.generateButton.innerText = "Generating...";
        this.generateButton.disabled = true;
    }

    generateText(){
        this.text = "You";
        for (let i = 0; i < this.sequence_length ; i++){
            let sequence = this.text_to_sequence(this.text);
            let padded_sequence = this.padSequence(sequence,this.sequence_length)
            let sequence_tensor =  tf.tensor(padded_sequence).expandDims(0);
            let word = this.predict(sequence_tensor);
            if( word === "eom"){
                break;
            }
            this.text = `${this.text} ${word}`;
        }
    }

    index_to_word(index){
        return reverse_word_index[index]
    }

    padSequence(sequence, length, pre=true){
        const emptyArray = new Array(length - sequence.length ).fill(0);
        if (pre) {
            return emptyArray.concat(sequence);
        }
        else{
            return sequence.concat(emptyArray);
        }
    }   

    printHello(){
        console.log("hello. Hi inside app.");
    }

    predict(input){
        const a = this.model.predict(input);
        const index = this.sample(a,this.temperature);
        const word = this.index_to_word(index);
        return word;
    }

    sample(tf_array,temperature) {
        return tf.tidy( () => {
            let a = tf_array.pow(tf.scalar(1/temperature));
            const p_sum = a.sum();
            a = a.div(p_sum);
          return this.random_choice(a);
    })};

    random_choice(tf_array){
        let sum = 0;
        const r = Math.random();
        const values = tf_array.dataSync();
        for (let i in values){
            sum += values[i];
            if ( r <= sum) return i;
        }
    }

    sequence_to_text(sequence){
        let text = ""
        const sequenceArray = sequence.dataSync();
        for (let i in sequenceArray){
            if( sequenceArray[i] in reverse_word_index ){
                text = `${text} ${this.index_to_word(sequenceArray[i])}`;
            }
        }
        return text;
    }

    text_to_sequence(text){
        let textSplit = text.toLowerCase().split(" ")
        let sequence = [];
        for (let i in textSplit){
            if (textSplit[i] in word_index){
                sequence.push(word_index[textSplit[i]]);
            }
            else{
                sequence.push(1);
            }
        } 
        return sequence;
    }

    format_text(){
        // capitalize I
        this.text = this.text.replaceAll(/ i /g, " I ");
        this.text = this.text.replaceAll(/ i'/g, " I'")
        // apply upper to first character in String
        this.text = this.text.replaceAll(/^[a-z]/g, (x) => {return x.toUpperCase()})
        // remove excess space with comma,semi colon and colon
        this.text = this.text.replaceAll(/ (,|;|:) /g,"$1 ");
        // merge full stops
        this.text = this.text.replaceAll(/\. \./g,"..");
        this.text = this.text.replaceAll(/\. \./g,".."); // do twice in a row
        // remove excess space with full stop
        this.text = this.text.replaceAll(/ \. /g,"\. ");
        // attach trailing dots to end of word
        this.text = this.text.replaceAll(/ \.\./g,"\.");
        //remove space at the end of a string.
        this.text = this.text.replace(/ \.$/,".");
        // apply upper case to first character of sentence
        this.text = this.text.replaceAll(/\. [a-z]/g, (x) => { return x.toUpperCase()} );

    }

}