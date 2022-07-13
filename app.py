
from flask import Flask, render_template, request, jsonify
import json
import tensorflow as tf
import numpy as np
import binascii
import imageio






file = open('light_model.json', 'r')
loaded_model_json = file.read()
model = tf.keras.models.model_from_json(loaded_model_json)
file.close()


model.load_weights("light_model.h5")
model.compile(loss='categorical_crossentropy',
              optimizer="Adam",
              metrics=['top_k_categorical_accuracy'])

with open('static/light_class_names.txt', 'r') as f:
    class_names = f.read().splitlines()


app = Flask(__name__)

@app.route('/')
def index_view():
    return render_template('index.html', class_names= json.dumps(class_names))



def format_output(output):

    output[0] = binascii.a2b_base64(output[0])


    new_out = [int(d)-48 for d in output[0]]



    data_window = output[1]
    x_min = data_window["x"]["min"]
    x_max = data_window["x"]["max"]
    y_min = data_window["y"]["min"]
    y_max = data_window["y"]["max"]
    width = x_max-x_min
    height = y_max-y_min

    dim = max(width, height)

    small_padding = int(dim/16)

    dim = dim+small_padding

    big_dim = max(width, height)
    small_dim = min(width,height)

    big_padding = int((big_dim-small_dim)/2) + small_padding





    model_input = np.array(new_out).reshape(1, height,width,1)
    model_input = model_input *255



    

    if width > height:
        npad = ((0,0),(big_padding,big_padding),(small_padding,small_padding),(0,0))        
    elif height > width:
        npad = ((0,0),(small_padding,small_padding),(big_padding,big_padding),(0,0))
    elif width == height:
        npad = ((0,0),(small_padding,small_padding),(small_padding,small_padding),(0,0))
    model_input = np.pad(model_input, npad, mode='constant', constant_values=255)




    model_input = tf.convert_to_tensor(model_input)
    model_input = tf.image.resize(model_input, [28, 28], method="bilinear", antialias=True)
    
    #model_input = model_input.reshape(1, 28, 28, 1)
    model_input = 255-model_input
    imageio.imwrite('name.jpg', model_input[0][:,:,0])
    model_input /= 255.0
    

    return model_input

@app.route('/predict/', methods=['GET', 'POST'])
def predict():

    
    output = request.json
    #model_input = format_output(output)
    model_input = format_output(output)
    model_output = model.predict(model_input)[0]

    data = []

    for i in range(0, len(model_output)):
        if model_output[i] > 0.05:
            data.append((class_names[i], model_output[i]))

    
    sorted_pairs = sorted(data, key=lambda x: x[1])

    sorted_pairs = sorted_pairs[::-1]

    data = []

    for i in sorted_pairs:
        data.append(i[0])

    


    
    
    json_return = json.dumps(data)
    return json_return


    
    


    
    #print(class_names[prediction[0]])


    #print(model_output)
    #print(10)
    #canvas_data = request.get_data()
    #convertImage(canvas_data)




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


""" def alt_format_output(output):


    image = output[0]

    width = output[1]["x"]["max"]-output[1]["x"]["min"]
    height = output[1]["y"]["max"]-output[1]["y"]["min"]
    
    original_side = max(height, width)

    for stroke in image:
        stroke[0] = stroke[0]-output[1]["x"]["min"]
        stroke[1] = stroke[1]-output[1]["y"]["min"]
    



    #No idea how this code converts, black magic (Google made it so its probably smart)
    line_diameter = padding = original_side/16
    bg_color = (0,0,0)
    fg_color = (1,1,1)
    side = 28

    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, side, side)
    ctx = cairo.Context(surface)
    ctx.set_antialias(cairo.ANTIALIAS_BEST)
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND)
    ctx.set_line_width(line_diameter)

    total_padding = padding * 2. + line_diameter
    new_scale = float(side) / float(original_side + total_padding)
    ctx.scale(new_scale, new_scale)
    ctx.translate(total_padding / 2., total_padding / 2.)
    ctx.set_source_rgb(*bg_color)
    ctx.paint()
        
    bbox = np.hstack(image).max(axis=1)
    offset = ((original_side, original_side) - bbox) / 2.
    offset = offset.reshape(-1,1)
    centered = [stroke + offset for stroke in image]

    ctx.set_source_rgb(*fg_color)        
    for xv, yv in centered:
        ctx.move_to(xv[0], yv[0])
        for x, y in zip(xv, yv):
            ctx.line_to(x, y)
        ctx.stroke()

    data = surface.get_data()
    numpy_bitmap = np.copy(np.asarray(data)[::4])

    print(numpy_bitmap) """