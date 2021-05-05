import * as tf from '@tensorflow/tfjs';
import word_index from './assets/model/word_index.js';
import reverse_word_index from './assets/model/reverse_word_index.js';

class PredictWorker{

    constructor(){
        this.model = null;
        this.sequence_length = 99;
        this.temperature = 0.1;
        this.max_length = 100;
    }

    loadModel() {
        tf.loadLayersModel("./assets/model/model.json").then( (model) => {
            this.model = model;
            self.postMessage({type:"load",data:"done"});
        })
    }

    generateText(){
        for (let i = 0; i < this.max_length ; i++){
            let sequence = this.text_to_sequence(this.text);
            let padded_sequence = this.padSequence(sequence,this.sequence_length)
            let sequence_tensor =  tf.tensor(padded_sequence).expandDims(0);
            let word = this.predict(sequence_tensor);
            self.postMessage({type:"generate",data: word});
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

}

self.onmessage = (m) => {
    switch(m.data.type){
        case "load":
            predictWorker.loadModel();
            break;
        case "generate":
            predictWorker.text = m.data.data;
            predictWorker.temperature = m.data.temp;
            predictWorker.max_length = m.data.length;
            predictWorker.generateText();
            break;
    }
}

console.info('TensorFlow.Js version', tf.version['tfjs'])
let predictWorker = new PredictWorker();