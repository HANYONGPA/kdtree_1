//easing함수를 황용할 수 있는 클래스입니다.
//https://easings.net/ko에서 원하는 함수를 집어 넣어 사용 가능합니다.
//기본 easeInOutSine 적용.

class EaseVec2 {
  constructor(aPos, bPos) {
    this.pos = aPos;
    this.aPos = this.pos.copy();
    this.bPos = bPos;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
  }

  easeVec2(duration) {
    this.duration = duration;
    this.dt = deltaTime * 0.001;
    this.elapsed += this.dt;
    this.t = this.elapsed / this.duration;

    this.pos.set(
      p5.Vector.lerp(this.aPos, this.bPos, this.easeInOutCubic(this.t))
    );

    if (this.elapsed >= duration) {
      this.aPos.set(this.bPos);
      this.elapsed = duration;
    }
  }

  update(bPos) {
    this.aPos.set(this.pos);
    this.elapsed = 0;
    this.bPos.set(bPos);
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  easeInOutBack(x) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}

class EaseVec2_ {
  constructor(aPos, bPos) {
    this.pos = aPos;
    this.aPos = this.pos.copy();
    this.bPos = bPos;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
  }

  easeVec2(duration) {
    this.duration = duration;
    this.dt = deltaTime * 0.001;
    this.elapsed += this.dt;
    this.t = this.elapsed / this.duration;

    this.pos.set(
      p5.Vector.lerp(this.aPos, this.bPos, this.easeOutElastic(this.t))
    );

    if (this.elapsed >= duration) {
      this.aPos.set(this.bPos);
      this.elapsed = duration;
    }
  }

  update(bPos) {
    this.aPos.set(this.pos);
    this.elapsed = 0;
    this.bPos.set(bPos);
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  easeInOutBack(x) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}

//단일 값에 대한 easing함수입니다.

class EaseFloat {
  constructor(aValue, bValue) {
    this.currentValue = aValue;
    this.aValue = this.currentValue;
    this.bValue = bValue;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
  }

  easeFloat(duration, v) {
    this.bValue = v;
    this.duration_f = duration;
    this.dt_f = deltaTime * 0.001;
    this.elapsed_f += this.dt_f;
    this.t_f = this.elapsed_f / this.duration_f;

    if (this.elapsed_f > this.duration_f) {
      this.elapsed_f = this.duration_f;
    }

    this.currentValue =
      this.aValue + (this.bValue - this.aValue) * this.easeInOutSine(this.t_f);
    return this.currentValue;
  }

  update_f(v) {
    this.aValue = this.currentValue;
    this.elapsed_f = 0;
    this.bValue = v;
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}
