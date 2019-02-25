
var t = 0;

function setup() {
  // create a canvas the same size the window
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);

  colors = [color(172, 128, 255),
            color(166, 226, 44),
            color(104, 216, 239),
            color(253, 150, 33),
            color(249, 36,  114),
            color(231, 219, 116)];
}

function draw() {
  background(10,0,20);
  // ambientLight(150);
  noStroke();
  // fill(colors[0]);
  rotateX(-mouseY/100);
  t += 1;
  
  pointLight(255, 230, 200, 0,0,0);
  
  fill(255, 230, 200);
  sphere(50);
  rotateY(t/50);
  translate(100, 0, 0);
  ambientMaterial(40,60,70, 255);
  sphere(20);
  ambientMaterial(100, 200, 250, 10);
  sphere(22);
  translate(-100, 0, 0);
  rotateY(-t/50);
  rotateY(t/111);
  translate(200, 0, 0);
  ambientMaterial(100,50,50, 255);
  sphere(14);
  ambientMaterial(100, 200, 250, 10);
  sphere(15);

}