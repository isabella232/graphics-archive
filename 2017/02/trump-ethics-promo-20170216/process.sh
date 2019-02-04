#!/bin/bash

# SET VARIABLES
FOLDER='assets'
COUNT=`ls -l $FOLDER/frames/*.png | wc -l`

# CONVERT FRAMES TO A FILMSTRIP
montage -border 0 -geometry 500x -tile $COUNT'x' -quality 75% $FOLDER'/frames/*.png' $FOLDER'/filmstrip-500.jpg'
montage -border 0 -geometry 320x -tile $COUNT'x' -quality 70% $FOLDER'/frames/*.png' $FOLDER'/filmstrip-320.jpg'

# CONVERT FRAMES TO GIF
# Note: To change the animation speed, tweak the first number in the "delay" value. Lower = faster.
# (Default of 30x60 means each frame displays for 1/2 second. 60x60 == one second.)
#convert -background white -alpha remove -layers optimize-plus -delay 30x60 -resize 600 $FOLDER'/frames/*.jpg' -loop 0 $FOLDER'/filmstrip.gif'
