import first_word from './assets/model/first_word.js';

export default class App {

    constructor()
    {
        this.temperature = 0.01;
        this.max_length = 100;
        this.text = "";
        this.generateButton = document.getElementById("generate-button");
        this.generatedText = document.getElementById("generated-text");
        this.temperature_slider = document.getElementById("temperature-slider");
        this.generateButton.disabled = true;
        this.workerSetup();
        this.generateButton.onclick = () => {
            this.generateText();
        }
        
        this.text_count = 0;
    }

    enableGeneration() {
        this.generateButton.innerText = "Generate a New Quote";
        this.generateButton.disabled = false;
    }

    disableGeneration(){
        this.generateButton.innerText = "Generating...";
        this.generateButton.disabled = true;
    }

    generateText(){
        this.text_count = 0;
        this.temperature = this.temperature_slider.value;
        console.log(this.temperature)
        this.disableGeneration();
        const randomNum = Math.floor(Math.random() * first_word.length); 
        this.text = first_word[randomNum];
        this.worker.postMessage({type:"generate",data: this.text, temp: this.temperature, length: this.max_length})
    }

    format_text(){
        // capitalize I
        this.text = this.text.replace(/ i /g, " I ");
        this.text = this.text.replace(/ i'/g, " I'");
        // apply upper to first character in String
        this.text = this.text.replace(/^[a-z]/g, (x) => {return x.toUpperCase()});
        // remove excess space with comma,semi colon and colon
        this.text = this.text.replace(/ (,|;|:|\?|!) /g,"$1 ");
        // merge full stops
        this.text = this.text.replace(/\. \./g,"..");
        this.text = this.text.replace(/\. \./g,".."); // do twice in a row
        // remove excess space with full stop
        this.text = this.text.replace(/ \. /g,"\. ");
        // attach trailing dots to end of word
        this.text = this.text.replace(/ \.\./g,"\.");
        //remove space at the end of a string.
        this.text = this.text.replace(/ (\.|\?|!)$/,"$1");
        // apply upper case to first character of sentence
        this.text = this.text.replace(/\. [a-z]/g, (x) => { return x.toUpperCase()} );

    }

    workerSetup(){
        this.worker = new Worker(new URL('./worker.js', import.meta.url));
        this.worker.postMessage({type: "load"});
        this.worker.onmessage = (m) =>
        {
            switch(m.data.type){
                case "load":
                    console.log("loaded");
                    this.enableGeneration();
                    break;
                case "generate":
                    if(m.data.data === "eom")
                    {
                        this.format_text();
                        this.generatedText.innerText = `"${this.text}"`;
                        this.enableGeneration();
                    }
                    else{
                        this.text_count += 1;
                        this.text = `${this.text} ${m.data.data}`;                       
                        this.generatedText.innerText = this.text;
                        if (this.text_count === this.max_length){
                            this.format_text();
                            this.generatedText.innerText = `"${this.text}"`;
                            this.enableGeneration();
                        }
                    }
                    break;
                }

        }
    }

}