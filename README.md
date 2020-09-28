# An TensorFlow.js Image Classification in a web browser
You can train your model in various different ways:
- use Python, convert the SavedModel or Keras model to TensorFlow.js model via tensorflowjs converter
- use Tensorflow.js 
- Teachable machine -> export to Kera model, convert to TensorFlow.js model via tensorflowjs converter https://github.com/tensorflow/tfjs/tree/master/tfjs-converter#getting-started
- Google AutoML vision -> export to Tensorflow.js model
- Azure Custom Visions -> export to Tensorflow.js model 

After you export the Tensorflowjs model, you host it in a cloud storage, and supply the model URL in the browser (add / at the end) :
https://<cloud storage url>/model/
Make sure your model include these files :
- model.json
- *.bin
- labels.txt

labels.txt is a text file with all the class name, one class per line, e.g.
```sh
apple
orange
```

## Setup 

Prepare the node environments:
```sh
$ npm install
# Or
$ yarn
```

Run the local web server (http://localhost:8080) script:
```sh
$ npm run start
```


