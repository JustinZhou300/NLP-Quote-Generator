import * as tf from '@tensorflow/tfjs';
import word_index from './assets/model/word_index.js';
import reverse_word_index from './assets/model/reverse_word_index.js';


type wordIndex = {
    [key: string]: number
}

type revserseWordIndex = {
    [key: string]: string
}


class PredictWorker{
    model: any;
    sequence_length: number;
    temperature: number;
    max_length: number;
    text: string;
    word_index : wordIndex;
    reverse_word_index : revserseWordIndex;

    constructor(){
        this.model = null;
        this.sequence_length = 99;
        this.temperature = 0.1;
        this.max_length = 100;
        this.word_index = word_index;
        this.reverse_word_index = reverse_word_index 
    }

    loadModel() : void {
        tf.loadLayersModel("./assets/model/model.json").then( (model) => {
            this.model = model;
            self.postMessage({type:"load",data:"done"});
        })
    }

    generateText() : void {
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

    index_to_word(index: string) : string {
        return this.reverse_word_index[index]
    }

    padSequence(sequence : number[], length: number, pre=true) : any[]{
        const emptyArray = new Array(length - sequence.length ).fill(0);
        if (pre) {
            return emptyArray.concat(sequence);
        }
        else{
            return sequence.concat(emptyArray);
        }
    }   

    predict(input : tf.Tensor) : string {
        const a = this.model.predict(input);
        const index = this.sample(a,this.temperature);
        const word = this.index_to_word(index.toString());
        return word;
    }

    sample(tf_array : tf.Tensor,temperature: number) : number {
        return tf.tidy( () => {
            let a = tf_array.pow(tf.scalar(1/temperature));
            const p_sum = a.sum();
            a = a.div(p_sum);
          return this.random_choice(a);
    })};

    random_choice(tf_array: tf.Tensor) : number {
        let sum = 0;
        const r = Math.random();
        const values = tf_array.dataSync();
        for (let i =0 ; i < values.length ; i++){
            sum += values[i];
            if ( r <= sum) return i;
        }
    }

    text_to_sequence(text: string) : number[]{
        let textSplit = text.toLowerCase().split(" ")
        let sequence = [];
        for (let i in textSplit){
            if (textSplit[i] in word_index){
                sequence.push( this.word_index[textSplit[i]] );
            }
            else{
                sequence.push(1);
            }
        } 
        return sequence;
    }

    sequence_to_text(sequence : tf.Tensor){
        let text = ""
        const sequenceArray = sequence.dataSync();
        for (let i in sequenceArray){
            if( sequenceArray[i] in this.reverse_word_index ){
                text = `${text} ${this.index_to_word(sequenceArray[i].toString())}`;
            }
        }
        return text;
    }

}

self.onmessage = (m: any) => {
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