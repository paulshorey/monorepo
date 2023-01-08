setTimeout(function () {
  if (typeof window !== "object" || typeof Matter !== "object") return;
  if (!document.body) return;

  const ELEMENT = document.querySelector(".DemoContainer");
  const WIDTH = ELEMENT.clientWidth;
  const HEIGHT = ELEMENT.clientHeight;

  function makeSVGText(str) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    {
      let o = {
        viewBox: "0 0 100 30",
        width: 100,
        height: 30,
        fill: "orange",
        stroke: "red"
      };
      for (let key in o) {
        let val = o[key];
        svg.setAttribute(key, val);
      }
    }
    svg.innerHTML = '<text x="50" y="15">'+str+'</text>';
    return svg;
  }

  var Example = Example || {};

  Example.svg = function () {
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Common = Matter.Common,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Vertices = Matter.Vertices,
      Svg = Matter.Svg,
      Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
      world = engine.world;

    // create renderer
    var render = Render.create({
      element: ELEMENT,
      engine: engine,
      options: {
        width: WIDTH,
        height: HEIGHT
      }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var svgs = ["check-mark-8-icon", "paperclip-2-icon", "puzzle-icon", "user-icon"];

    if (typeof $ !== "undefined") {
      for (var i = 0; i < svgs.length; i += 1) {
        (function (i) {
          var svgEl = drawText(svgs[i]);
          var vertexSets = [],
            color = Common.choose(["#f19648", "#f5d259", "#f55a3c", "#063e7b", "#ececd1"]);

          $(svgEl)
            .find("path")
            .each(function (i, path) {
              var points = Svg.pathToVertices(path, 30);
              vertexSets.push(Vertices.scale(points, 0.4, 0.4));
            });

          World.add(
            world,
            Bodies.fromVertices(
              100 + i * 150,
              200 + i * 50,
              vertexSets,
              {
                render: {
                  fillStyle: color,
                  strokeStyle: color,
                  lineWidth: 1
                }
              },
              true
            )
          );
        })(i);
      }
    }

    World.add(world, [
      Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
      Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
      engine: engine,
      runner: runner,
      render: render,
      canvas: render.canvas,
      stop: function () {
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
      }
    };
  };

  if (typeof module !== "undefined") {
    module.exports = Example[Object.keys(Example)[0]];
  }
}, 5000);
