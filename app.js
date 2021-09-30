// Why github pages not updating???

let body = document.getElementById('canvas');
let status = document.getElementById('status');
let substatus = document.getElementById('substatus');
let coords = document.getElementById('coords');
let vertsStatus = document.getElementById('verts');

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Edge {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

let verts = [];

function getCursorPosition(event) {
    const rect = body.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return new Point(x, y)
}

const Area2 = (a, b, c) => {
    return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

const Left = (a, b, c) => {
    return Area2(a, b, c) > 0;
}

const LeftOn = (a, b, c) => {
    return Area2(a, b, c) >= 0;
}

const Collinear = (a, b, c) => {
    return Area2(a, b, c) == 0;
}

const IntersectProp = (a, b, c, d) => {
    if (Collinear(a, b, c) || Collinear(a, b, d) || Collinear(c, d, a) || Collinear(c, d, b)) {
        return false;
    }
    return Left(a, b, c) != Left(a, b, d) && Left(c, d, a) != Left(c, d, b);
}

const Between = (a, b, c) => {
    if (!Collinear(a, b, c)) {
        return false;
    }
    if (a.x != b.x) {
        return (a.x <= c.x && c.x <= b.x) || (a.x >= c.x && c.x >= b.x);
    } else {
        return (a.y <= c.y && c.y <= b.y) || (a.y >= c.y && c.y >= b.y);
    }
}

const Intersect = (a, b, c, d) => {
    if (IntersectProp(a, b, c, d)) {
        return true;
    } else if (Between(a, b, c) || Between(a, b, d) || Between(c, d, a) || Between(c, d, b)) {
        return true;
    }
    return false;
}

const drawTriangle = (a, b, c) => {
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        console.log(ctx);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        var randomColor = Math.floor(Math.random()*16777215).toString(16);
        ctx.fillStyle = '#' + randomColor;
        ctx.fill();
    }
}

// a b c
// a b
// a c
// b c

// d e f
// d e
// d f
// e f

const pointIsInTriangle = (a, b, c, point) => {
    // if (LeftOn(c, b, point) && LeftOn(b, a, point) && LeftOn(a, c, point)) {
    if (LeftOn(a, b, point) && LeftOn(b, c, point) && LeftOn(c, a, point)) {
        return true;
    }
    return false;
}

const TriTriIntersect = (a, b, c, d, e, f) => {
    // Create edges array for each triangle
    edges1 = [new Edge(a, b), new Edge(a, c), new Edge(b, c)];
    edges2 = [new Edge(d, e), new Edge(d, f), new Edge(e, f)];
    // Check if any pair of edges between the two triangles intersect
    for (let i = 0; i < edges1.length; i++) {
        for (let j = 0; j < edges2.length; j++) {
            if (Intersect(edges1[i].a, edges1[i].b, edges2[j].a, edges2[j].b)) {
                return true;
            }
        }
    }
    // Check if triangle def is inside triangle abc
    if (pointIsInTriangle(a, b, c, d) && pointIsInTriangle(a, b, c, e) && pointIsInTriangle(a, b, c, f)) {
        return true;
    }
    // Check if triangle abc is inside triangle def
    if (pointIsInTriangle(d, e, f, a) && pointIsInTriangle(d, e, f, b) && pointIsInTriangle(d, e, f, c)) {
        return true;
    }
    return false;
}

const clearCanvas = () => {
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

const updateVertsStatus = () => {
    vertsStatus.innerHTML = "Triangle 1: ";
    verts.forEach((vert, index) => {
        if (index == 3) {
            vertsStatus.innerHTML += "<br /><br />Triangle 2: ";
        }
        char = String.fromCharCode(65 + index);
        let ctx = canvas.getContext('2d');
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(char, vert.x, vert.y);
        if (index != 2 && index != 5) {
            vertsStatus.innerHTML += `${char}: (${vert.x}, ${vert.y}), `;
        } else {
            vertsStatus.innerHTML += `${char}: (${vert.x}, ${vert.y})`;
        }
    });
}

body.addEventListener('mousemove', (e) => {
    coords.innerHTML = `X: ${getCursorPosition(e).x} Y: ${getCursorPosition(e).y}`;
});

body.addEventListener('click', function(e) {

    verts.push(getCursorPosition(e));
    if (verts.length == 3) {
        let area = Area2(verts[0], verts[1], verts[2]);
        if (area < 0) {
            let temp = verts[0];
            verts[0] = verts[2];
            verts[2] = temp;
        }

        clearCanvas();
        drawTriangle(verts[0], verts[1], verts[2]);

        status.innerHTML = 'Only one triangle detected.';
        substatus.innerHTML = 'Please draw another triangle.';
        updateVertsStatus();
    } else if (verts.length == 6) {
        let area = Area2(verts[3], verts[4], verts[5]);
        if (area < 0) {
            let temp = verts[3];
            verts[3] = verts[5];
            verts[5] = temp;
        }

        drawTriangle(verts[3], verts[4], verts[5]);

        if (TriTriIntersect(verts[0], verts[1], verts[2], verts[3], verts[4], verts[5])) {
            status.innerHTML = 'Your two triangles intersect!';
        } else {
            status.innerHTML = 'Your two triangles do not intersect!';
        }
        substatus.innerHTML = 'Click three times again to clear the canvas and draw \
        another triangle.';
        updateVertsStatus();
        verts = [];
    }
    console.log(verts);
});
