// function preload() {
//   VCR_OSD_MONO = loadFont("/fonts/VCR_OSD.ttf");
//   aktivBD = loadFont("/fonts/aktivBD.ttf");
//   sabonNextBDI = loadFont("/fonts/SabonNextLTBoldItalic.ttf");
//   SM3mu = loadFont("/fonts/SM3mu.otf");
// }

let VCR_OSD_MONO;
let aktivBD;
let sabonNextBDI;
let SM3mu;

let kdTree;
let cg;
let debugMode = false;
let lineShow = true;
let colorShow = false;

let txt = "한용파";
let col = 200;
let row = col;
let posArr = [];
let darkPixelPositions = [];

let num = 20;

function setup() {
  VCR_OSD_MONO = loadFont("fonts/VCR_OSD.ttf");
  aktivBD = loadFont("fonts/aktivBD.ttf");
  sabonNextBDI = loadFont("fonts/SabonNextLTBoldItalic.ttf");
  SM3mu = loadFont("fonts/SM3mu.otf");
  createCanvas(windowWidth, windowHeight);
  cg = createGraphics(width, height);
  cg.background(255);
  cg.textFont(SM3mu);
  cg.textAlign(CENTER, CENTER);
  cg.push();
  cg.textSize(height * 0.45);
  // cg.text(txt, width * 0.52, height * 0.4);
  cg.pop();
  textFont(aktivBD);
  textAlign(CENTER, CENTER);

  kdTree = new KDTree();
  const depth = 13;
  kdTree.buildCompleteTree(depth);

  // for (let x = 0; x < col; x++) {
  //   for (let y = 0; y < row; y++) {
  //     let posX = (width / col) * x;
  //     let posY = (height / row) * y;
  //     let c = cg.get(posX, posY);
  //     if (c[0] === 0) {
  //       darkPixelPositions.push(createVector(posX, posY));
  //     }
  //   }
  // }
}

function draw() {
  background(255);
  // cg.background(255);
  // image(cg, 0, 0);
  cg.push();
  cg.textSize(height * 0.5);
  cg.text(txt, width * 0.52, height * 0.4);
  cg.pop();
  kdTree.display();
  if (frameCount % 20 === 0) {
    kdTree.traverseAllNodes(kdTree.root, (node) => {
      if (node.depth === num) {
        node.go();
      }
    });
    num++;
  }
  // image(cg, 0, 0);
}

function mousePressed() {
  kdTree.insert(createVector(mouseX, mouseY));
}

function keyPressed() {
  if (keyCode === 67) {
    colorShow = !colorShow;
  }
  if (keyCode === 68) {
    debugMode = !debugMode;
  }
  if (keyCode === 76) {
    lineShow = !lineShow;
  }

  if (keyCode === 48) {
    for (let x = 0; x < col; x++) {
      for (let y = 0; y < row; y++) {
        let posX = (width / col) * x;
        let posY = (height / row) * y;
        let c = cg.get(posX, posY);
        if (c[0] === 0) {
          darkPixelPositions.push(createVector(posX, posY));
        }
      }
    }
    kdTree.traverseAllNodes(kdTree.root, (node) => {
      node.targetPercentage.set(0.5, 0.5);
      node.ease.update(node.targetPercentage);
    });
    num = 0;
  }

  // if (keyCode === 49) {
  //   kdTree.traverseAllNodes(kdTree.root, (node) => {
  //     if (node.depth === num) {
  //       node.go();
  //       node.ease.update(node.targetPercentage);
  //     }
  //   });
  //   num--;
  // }

  if (keyCode === 32) {
    kdTree.traverseAllNodes(kdTree.root, (node) => {
      const randomX = random(1);
      const randomY = random(1);
      node.axis === 0
        ? node.targetPercentage.set(randomX, node.percentage.y)
        : node.targetPercentage.set(node.percentage.x, randomY);
      node.ease.update(node.targetPercentage);
    });
  }
}

class Node {
  constructor(
    x,
    y,
    axis,
    minX = 0,
    maxX = width,
    minY = 0,
    maxY = height,
    depth,
    parent = null
  ) {
    this.axis = axis;
    this.depth = depth;
    this.percentage = createVector(
      (x - minX) / (maxX - minX),
      (y - minY) / (maxY - minY)
    );
    this.left = null;
    this.right = null;
    this.parent = parent;

    this.paddingTB = 0;
    this.paddingLR = 0;

    this.minPos = createVector(minX + this.paddingLR, minY + this.paddingTB);
    this.maxPos = createVector(maxX - this.paddingLR, maxY - this.paddingTB);
    this.aPos = new p5.Vector(x, y);
    this.bPos = new p5.Vector(x, y);
    this.aVel = new p5.Vector(0, 0);
    this.bVel = new p5.Vector(0, 0);
    this.aAcc = new p5.Vector(0, 0);
    this.bAcc = new p5.Vector(0, 0);
    this.randomDecay = random(0.85, 0.85);
    this.randomElasticity = random(0.05, 0.05);
    this.randomValue = createVector(random(1000), random(1000));

    this.colAlpha = 0;
    this.colLeft = color(random(255));
    this.colRight = color(random(255));

    this.targetPercentage = createVector(this.percentage.x, this.percentage.y);
    this.aTarget = createVector(this.aPos.x, this.aPos.y);
    this.bTarget = createVector(this.bPos.x, this.bPos.y);
    this.ease = new EaseVec2(this.percentage, this.targetPercentage);
    this.updatePos();
  }

  findClosestDarkPixel() {
    let closestPos = null;
    let closestDist = Infinity;

    for (let i = 0; i < darkPixelPositions.length; i++) {
      let dist = p5.Vector.dist(this.pos, darkPixelPositions[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestPos = darkPixelPositions[i];
      }
    }

    return closestPos;
  }

  go() {
    let closestDarkPos = this.findClosestDarkPixel(this.pos);
    if (closestDarkPos) {
      let relativeX =
        (closestDarkPos.x - this.minPos.x) / (this.maxPos.x - this.minPos.x);
      let relativeY =
        (closestDarkPos.y - this.minPos.y) / (this.maxPos.y - this.minPos.y);

      this.targetPercentage.set(
        constrain(relativeX, 0, 0.8),
        constrain(relativeY, 0, 0.8)
      );
      this.ease.update(this.targetPercentage);
    }
  }

  updatePos() {
    this.ease.easeVec2(0.7);

    this.pos = createVector(
      this.minPos.x + this.percentage.x * (this.maxPos.x - this.minPos.x),
      this.minPos.y + this.percentage.y * (this.maxPos.y - this.minPos.y)
    );

    if (this.axis === 0) {
      this.aTarget.set(this.pos.x, this.minPos.y);
      this.bTarget.set(this.pos.x, this.maxPos.y);
    } else {
      this.aTarget.set(this.minPos.x, this.pos.y);
      this.bTarget.set(this.maxPos.x, this.pos.y);
    }

    this.aAcc = p5.Vector.sub(this.aTarget, this.aPos).mult(
      this.randomElasticity
    );
    this.bAcc = p5.Vector.sub(this.bTarget, this.bPos).mult(
      this.randomElasticity
    );
    this.aVel.add(this.aAcc);
    this.bVel.add(this.bAcc);
    this.aVel.mult(this.randomDecay);
    this.bVel.mult(this.randomDecay);
    this.aPos.add(this.aVel);
    this.bPos.add(this.bVel);
    this.aAcc.mult(0);
    this.bAcc.mult(0);

    this.updateBounds(
      this.minPos.x,
      this.maxPos.x,
      this.minPos.y,
      this.maxPos.y
    );
  }

  updateBounds(minX, maxX, minY, maxY) {
    this.minPos.set(minX, minY);
    this.maxPos.set(maxX, maxY);

    if (this.left) {
      this.left.updateBounds(
        minX,
        this.axis === 0 ? this.pos.x : maxX,
        minY,
        this.axis === 1 ? this.pos.y : maxY
      );
    }
    if (this.right) {
      this.right.updateBounds(
        this.axis === 0 ? this.pos.x : minX,
        maxX,
        this.axis === 1 ? this.pos.y : minY,
        maxY
      );
    }
  }

  isRightChild() {
    if (this.parent) {
      return this.parent.right === this;
    }
    return false;
  }
  isLeftChild() {
    if (this.parent) {
      return this.parent.left === this;
    }
    return false;
  }

  getVertices(vertices) {
    vertices.push(this.aPos);

    if (this.left) {
      this.left.getVertices(vertices);
    }

    if (this.right) {
      this.right.getVertices(vertices);
    }

    vertices.push(this.bPos);
  }

  displayLine() {
    let vertices = [];
    this.getVertices(vertices);
    noFill();
    stroke(0);
    strokeWeight(2);
    beginShape();
    for (let v of vertices) {
      vertex(v.x, v.y);
    }
    endShape();

    beginShape();
    noFill();

    endShape();
    if (this.left) {
      this.left.displayLine();
    }
    if (this.right) {
      this.right.displayLine();
    }
  }

  display() {
    this.updatePos();
    // this.go();
    if (lineShow) {
      stroke(0);
      stroke(0);
      strokeWeight(1);
    } else {
      noStroke();
    }
    // ellipse(this.pos.x, this.pos.y, 5);
    // ellipse(this.aPos.x, this.aPos.y, 5);
    // ellipse(this.bPos.x, this.bPos.y, 5);
    // line(this.aPos.x, this.aPos.y, this.bPos.x, this.bPos.y);
    // if (this.axis === 0) {
    //   line(this.pos.x, this.minPos.y, this.pos.x, this.maxPos.y);
    // } else {
    //   line(this.minPos.x, this.pos.y, this.maxPos.x, this.pos.y);
    // }

    if (this.left) {
      this.left.display();
    }
    if (this.right) {
      this.right.display();
    }
  }
}

class KDTree {
  constructor() {
    this.root = null;
  }

  buildCompleteTree(depth) {
    this.root = this.buildRecursive(depth, 0, 0, width, 0, height, null);
  }

  buildRecursive(depth, currentDepth, minX, maxX, minY, maxY, parent) {
    if (currentDepth >= depth) {
      return null;
    }

    const axis = currentDepth % 2;
    const x = (minX + maxX) / 2;
    const y = (minY + maxY) / 2;

    const node = new Node(
      x,
      y,
      axis,
      minX,
      maxX,
      minY,
      maxY,
      currentDepth,
      parent
    );
    node.left = this.buildRecursive(
      depth,
      currentDepth + 1,
      minX,
      axis === 0 ? x : maxX,
      minY,
      axis === 1 ? y : maxY,
      node
    );
    node.right = this.buildRecursive(
      depth,
      currentDepth + 1,
      axis === 0 ? x : minX,
      maxX,
      axis === 1 ? y : minY,
      maxY,
      node
    );

    return node;
  }

  insert(
    pos,
    depth = 0,
    minX = 0,
    maxX = width,
    minY = 0,
    maxY = height,
    parent = null
  ) {
    const axis = depth % 2; // 0 : x, 1 : y
    this.root = this.recursiveInsert(
      this.root,
      pos,
      axis,
      minX,
      maxX,
      minY,
      maxY,
      depth,
      parent
    );
  }

  recursiveInsert(node, pos, axis, minX, maxX, minY, maxY, depth, parent) {
    if (!node) {
      return new Node(
        pos.x,
        pos.y,
        axis,
        minX,
        maxX,
        minY,
        maxY,
        depth,
        parent
      );
    }

    const currentAxis = node.axis;
    const posKey = axis === 0 ? pos.x : pos.y;
    const nodeKey = axis === 0 ? node.pos.x : node.pos.y;

    if (posKey < nodeKey) {
      if (axis === 0) {
        node.left = this.recursiveInsert(
          node.left,
          pos,
          (currentAxis + 1) % 2,
          minX,
          node.pos.x,
          minY,
          maxY,
          depth + 1,
          node
        );
      } else {
        node.left = this.recursiveInsert(
          node.left,
          pos,
          (currentAxis + 1) % 2,
          minX,
          maxX,
          minY,
          node.pos.y,
          depth + 1,
          node
        );
      }
    } else {
      if (axis === 0) {
        node.right = this.recursiveInsert(
          node.right,
          pos,
          (currentAxis + 1) % 2,
          node.pos.x,
          maxX,
          minY,
          maxY,
          depth + 1,
          node
        );
      } else {
        node.right = this.recursiveInsert(
          node.right,
          pos,
          (currentAxis + 1) % 2,
          minX,
          maxX,
          node.pos.y,
          maxY,
          depth + 1,
          node
        );
      }
    }

    return node;
  }

  traverseAllNodes(node, action) {
    if (node) {
      this.traverseAllNodes(node.left, action);
      action(node);
      this.traverseAllNodes(node.right, action);
    }
  }

  display() {
    if (this.root) {
      this.root.display();
      this.root.displayLine();
    }
  }
}
