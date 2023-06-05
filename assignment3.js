import { defs, tiny } from './examples/common.js';

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Texture,
} = tiny;
const { Textured_Phong } = defs;

export class Assignment3 extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      torus: new defs.Torus(15, 15),
      torus2: new defs.Torus(3, 15),
      sphere: new defs.Subdivision_Sphere(4),
      circle: new defs.Regular_2D_Polygon(1, 15),
      cylinder: new defs.Capped_Cylinder(15, 15),
      square: new defs.Square(),
      cube: new defs.Cube(),
      sun: new defs.Subdivision_Sphere(4),
      planet1:
        new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
      planet2: new defs.Subdivision_Sphere(3),
      //ball: new defs.Subdivision_Sphere(4),
      ball: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(
        3
      ),
      cone: new defs.Cone_Tip(3, 3, [0, 1]),
      triangle: new defs.Triangle(),
      ring: new defs.Torus(50, 50),
      planet4: new defs.Subdivision_Sphere(4),
      moon: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(
        1
      ),
    };

    // *** Materials
    this.materials = {
      test: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color('#ffffff'),
      }),
      test2: new Material(new Gouraud_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color('#992828'),
      }),
      sun: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#ffffff'),
      }),
      texture: new Material(new Textured_Phong(), {
        color: hex_color('#000000'),
        ambient: 1,
        diffusivity: 0.2,
        specularity: 0.2,
        texture: new Texture('assets/grass_texture.jpg'),
      }),
      ball: new Material(new Gouraud_Shader(), {
        ambient: 0.8,
        diffusivity: 1,
        color: hex_color('#ffffff'),
        specularity: 0,
      }),
    };

      this.initial_camera_location = Mat4.look_at(
      vec3(20, 8, 0),
      vec3(50, 0, 0),
      vec3(0, 1, 0)
    );
    this.kick = false;
    this.ball_in_air=false;
    this.time_of_kick=0;

    //The "power" of the kick is equivilant to the intitial velocity of the ball before it's projectile motion
    this.power=10;
    //the lr (left-right) allows us to shift where the ball ends up on our kick along the horizontal
    this.lr_angle=0;

    //the ud (up-down) allows us to shit where the ball ends up on our kick up and down
    this.ud_angle=0;
    this.miss = false;
    //The amount of gravity on our planet!
    this.gravity=4;
    this.point_transform = Mat4.identity().times(Mat4.translation(40, 0.8, 0.1))
        .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
    this._transform = Mat4.identity().times(Mat4.translation(38, 0.5, 0))
        .times(Mat4.scale(1, 0.1, 0.1))
        .times(Mat4.translation(1, 1, 0));
    this.goal = false;
    this.score = 0;
      this.goalie_position = 0;
      this.goalie_speed = 10;
      this.goalie_direction = 1;
      this.isGoalieRandom = false;
      this.goalie_random_timer = 0;
      this.goalieDirChangeFrequency = 0.5; // change / s
  }

  billboard(context, program_state) {

  }
  handleAngleUp()
  {
    //this.ud_prev = this.ud_angle;
    //Only update when the ball hasn't been kicked or when it's not in the air
    if (!this.ball_in_air && !this.kick)
    {
      //Increment the angle by 5 degrees
      this.ud_angle=this.ud_angle+0.087;

      //If it's now over our limit (40 degrees), set it to it back down to 40 degrees
      if (this.ud_angle>0.69)
      {
        this.ud_angle=0.69
      }
      console.log(this.ud_angle)

      this._transform =
          Mat4.identity().times(Mat4.translation(38, 0.5, 0))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
              .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.scale(1, 0.1, 0.1))
          .times(Mat4.translation(1, 1, 0));

      this.point_transform =
          Mat4.identity().times(Mat4.translation(37.7, 0.8, 0.1))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
              .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.translation(2.3, 0, 0))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }
  handleAngleDown()
  {
    //Only update when the ball hasn't been kicked or when it's not in the air
    if (!this.ball_in_air && !this.kick) {
      //Decrement the angle by 5 degrees
      this.ud_angle = this.ud_angle - 0.087;

      //If it's below zero degrees, then set it back to our limit of zero
      if (this.ud_angle < 0.02) {
        this.ud_angle = 0;
      }
      console.log(this.ud_angle)
      this._transform =Mat4.identity().times(Mat4.translation(38, 0.5, 0))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
          .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.scale(1, 0.1, 0.1))
          .times(Mat4.translation(1, 1, 0));
      this.point_transform = Mat4.identity().times(Mat4.translation(37.7, 0.8, 0.1))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
          .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.translation(2.3, 0, 0))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }
  handleAngleLeft()
  {
    //Only update when the ball hasn't been kicked or when it's not in the air
    if (!this.ball_in_air && !this.kick) {
      //Decrement the angle by 5 degrees
      this.lr_angle = this.lr_angle + 0.087;

      //If it's below zero degrees, then set it back to our limit of zero
      if (this.lr_angle > Math.PI/4) {
        this.lr_angle = Math.PI/4;
      }
      console.log(this.lr_angle)
      this._transform =Mat4.identity().times(Mat4.translation(38, 0.5, 0))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
          .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.scale(1, 0.1, 0.1))
          .times(Mat4.translation(1, 1, 0));
      this.point_transform = Mat4.identity().times(Mat4.translation(37.7, 0.8, 0.1))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
          .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.translation(2.3, 0, 0))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }
  handleAngleRight()
  {
    if (!this.ball_in_air && !this.kick) {
      //Decrement the angle by 5 degrees
      this.lr_angle = this.lr_angle - 0.087;

      //If it's below zero degrees, then set it back to our limit of zero
      if (this.lr_angle < (-1*Math.PI/4)) {
        this.lr_angle = -1*Math.PI/4;
      }
      console.log(this.lr_angle)
      this._transform =Mat4.identity().times(Mat4.translation(38, 0.5, 0))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
          .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.scale(1, 0.1, 0.1))
          .times(Mat4.translation(1, 1, 0));
      this.point_transform = Mat4.identity().times(Mat4.translation(37.7, 0.8, 0.1))
          .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
          .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
          .times(Mat4.translation(2.3, 0, 0))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }

  //This is to be used when a collision is detected and we need to line things up for the next shot...we will have to do this when resetting the game state
  resetGoalState()
  {
    this.kick = false;
    this.ball_in_air=false;
    this.time_of_kick=0;

    //The "power" of the kick is equivilant to the intitial velocity of the ball before it's projectile motion
    this.power=10;
    //the lr (left-right) allows us to shift where the ball ends up on our kick along the horizontal
    this.lr_angle=0;

    //the ud (up-down) allows us to shit where the ball ends up on our kick up and down
    this.ud_angle=0;
    //The amount of gravity on our planet!
    this.gravity=4;
    this.point_transform = Mat4.identity().times(Mat4.translation(40, 0.8, 0.1))
        .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
    this._transform = Mat4.identity().times(Mat4.translation(38, 0.5, 0))
        .times(Mat4.scale(1, 0.1, 0.1))
        .times(Mat4.translation(1, 1, 0));
  }
  handleIncreasePower()
  {
  }

  handleDecreasePower()
  {
  }


  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    // this.key_triggered_button("View solar system", ["Control", "0"], () => this.attached = () => this.initial_camera_location);
    // this.new_line();
    // this.key_triggered_button("Attach to planet 1", ["Control", "1"], () => this.attached = () => this.planet_1);
    // this.key_triggered_button("Attach to planet 2", ["Control", "2"], () => this.attached = () => this.planet_2);
    // this.new_line();
    // this.key_triggered_button("Attach to planet 3", ["Control", "3"], () => this.attached = () => this.planet_3);
    // this.key_triggered_button("Attach to planet 4", ["Control", "4"], () => this.attached = () => this.planet_4);
    // this.new_line();
    // this.key_triggered_button("Attach to moon", ["Control", "m"], () => this.attached = () => this.moon);
    // this.new_line();
    this.key_triggered_button(
      'kick',
      ['t'],
      () => (this.kick = !this.ball_in_air)
    );
    //99999999
    this.key_triggered_button(
        'aim_up',
        ['9'],
        () => this.handleAngleUp()
    );
    this.key_triggered_button(
        'aim_down',
        ['8'],
        () =>this.handleAngleDown()
    );
    this.key_triggered_button(
        'aim_left',
        ['7'],
        () =>this.handleAngleLeft()
    );
    this.key_triggered_button(
        'aim_right',
        ['6'],
        () =>this.handleAngleRight()
    );
    this.key_triggered_button(
        'collision detected',
        ['b'],
        () =>this.resetGoalState()
    );
    this.key_triggered_button(
        'increase power',
        ['p'],
        () => (this.power= this.power+1)
    );
    this.key_triggered_button(
        'decrease power',
        ['q'],
        () => (this.power= this.power-1)
    );
      this.key_triggered_button(
          `toggle difficulty`,
          ['g'],
          () => {
              this.isGoalieRandom = !this.isGoalieRandom;
              if (this.isGoalieRandom) {
                  this.goalie_speed += 5;
              } else {
                  this.goalie_speed -= 5;
              }
          }
      );
  }

  draw_stadium(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;
    const yellow = hex_color('#fac91a');
    let model_transform = Mat4.identity();

    let pitch_x_dim = 55;
    let pitch_y_dim = 25;

    let stand_height = 25;

    let screen_scale_x = 10;
    let screen_scale_y = 5;
    let screen_scale_z = 1.5;

    //Make the concrete base
    let concerete_color = color(0.83, 0.83, 0.83, 1);

    let sun_radius = 5;
    let light_color = color(1, 1, 1, 1);
    let bulb_color = color(1, 1, 0.2, 1);

    //Make a point light source of the same color of the sun located in the center of the sun
    const reflectionMatrix = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    const rotationAngle = [
      Math.PI / 4,
      (3 * Math.PI) / 4,
      (-1 * Math.PI) / 4,
      (-3 * Math.PI) / 4,
    ];

    let sceneLights = [];

    for (let i = 0; i < reflectionMatrix.length; i++) {
      var currReflection = reflectionMatrix[i];

      let pillar_transform = model_transform
        .times(
          Mat4.translation(
            (pitch_x_dim + 3) * currReflection[0],
            0,
            (pitch_y_dim + 3) * currReflection[1]
          )
        )
        .times(Mat4.rotation(rotationAngle[i], 0, 1, 0))
        .times(Mat4.translation(0, stand_height, 0))
        .times(Mat4.scale(1, stand_height, 1));

      let light_base_transform = pillar_transform
        .times(Mat4.scale(1, 1 / stand_height, 1))
        .times(Mat4.translation(0, stand_height, 0))
        .times(Mat4.scale(1.5, 1.5, 1))
        .times(Mat4.translation(5, 1.25, -1));
      for (let i = 0; i < 5; i++) {
        let light1_transform = light_base_transform.times(
          Mat4.translation(-2.5 * i, 0, 0)
        );
        let light1_pos = light1_transform.times(vec4(0, 0, 0, 1));
        sceneLights.push(new Light(light1_pos, light_color, 7 ** sun_radius));

        let light2_transform = light_base_transform.times(
          Mat4.translation(-2.5 * i, -2.5, 0)
        );
        let light2_pos = light2_transform.times(vec4(0, 0, 0, 1));
        sceneLights.push(new Light(light2_pos, light_color, 7 ** sun_radius));
      }
    }

    program_state.lights = sceneLights;
    //console.log(program_state.lights);

    let concerete_transform = model_transform
      .times(Mat4.translation(0, -0.1, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(pitch_x_dim * 1.5, pitch_y_dim * 1.5, 1));
    this.shapes.square.draw(
      context,
      program_state,
      concerete_transform,
      this.materials.sun.override({ color: concerete_color })
    );

    // Draw the pitch
    let pitch_transform = model_transform
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(pitch_x_dim, pitch_y_dim, 1));
    this.shapes.square.draw(
      context,
      program_state,
      pitch_transform,
      this.materials.texture
    );

    //STAND CODE -----------------------------------
    let stand_color = color(0.298, 0.298, 0.298, 1);

    for (let i = 0; i < 8; i++) {
      let stand2_transform = model_transform
        .times(Mat4.translation(0, 0, pitch_y_dim))
        .times(Mat4.scale(pitch_x_dim, 1.25 * (i + 1), 1.5))
        .times(Mat4.translation(0, 1, i));
      this.shapes.cube.draw(
        context,
        program_state,
        stand2_transform,
        this.materials.sun.override({ color: stand_color })
      );
    }

    for (let i = 0; i < 8; i++) {
      let stand2_transform = model_transform
        .times(Mat4.translation(0, 0, -1 * pitch_y_dim))
        .times(Mat4.scale(pitch_x_dim, 1.25 * (i + 1), 1.5))
        .times(Mat4.translation(0, 1, -i));
      this.shapes.cube.draw(
        context,
        program_state,
        stand2_transform,
        this.materials.sun.override({ color: stand_color })
      );
    }

    //LIGHTSTAND CODE

    for (let i = 0; i < reflectionMatrix.length; i++) {
      var currReflection = reflectionMatrix[i];

      let pillar_transform = model_transform
        .times(
          Mat4.translation(
            (pitch_x_dim + 3) * currReflection[0],
            0,
            (pitch_y_dim + 3) * currReflection[1]
          )
        )
        .times(Mat4.rotation(rotationAngle[i], 0, 1, 0))
        .times(Mat4.translation(0, stand_height, 0))
        .times(Mat4.scale(1, stand_height, 1));
      this.shapes.cube.draw(
        context,
        program_state,
        pillar_transform,
        this.materials.sun.override({ color: stand_color })
      );

      let screen_transform = pillar_transform
        .times(Mat4.scale(1, 1 / stand_height, 1))
        .times(Mat4.translation(0, stand_height, 0))
        .times(Mat4.scale(screen_scale_x, screen_scale_y, screen_scale_z));
      this.shapes.cube.draw(
        context,
        program_state,
        screen_transform,
        this.materials.sun.override({ color: stand_color })
      );

      let light_base_transform = pillar_transform
        .times(Mat4.scale(1, 1 / stand_height, 1))
        .times(Mat4.translation(0, stand_height, 0))
        .times(Mat4.scale(1.5, 1.5, 1))
        .times(Mat4.translation(5, 1.25, -1));
      for (let i = 0; i < 5; i++) {
        let light1_transform = light_base_transform.times(
          Mat4.translation(-2.5 * i, 0, 0)
        );
        this.shapes.cube.draw(
          context,
          program_state,
          light1_transform,
          this.materials.sun.override({ color: bulb_color })
        );

        let light2_transform = light_base_transform.times(
          Mat4.translation(-2.5 * i, -2.5, 0)
        );
        this.shapes.cube.draw(
          context,
          program_state,
          light2_transform,
          this.materials.sun.override({ color: bulb_color })
        );
      }
    }
  }
  draw_ball(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    let t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;
    let time = t;
    let model_transform = Mat4.identity();

    //correct dimensions but looks wrong, we dont use most of the pitch anyways. we could have the ball on the halfway line
    if (!this.goal) {
      let ball_transform = model_transform
        .times(Mat4.translation(38, 0.5, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));

      if (this.kick) {
        let curr = new Date().getTime();
        //time = ((new Date().getTime()) - this.kick_t)%10;
        //console.log(time);
        ball_transform = ball_transform.times(
          Mat4.translation(time * Math.cos(0.5) + 30, time * Math.sin(0.5), 0)
        );
        //the time is always running and therefore the ball teleports. need to keep time 0 until clicked.

        //if on the pitch, roll

        if (ball_transform.valueOf()[0][3] > 55.0) {
          // trying to figure it out
          this.goal = true;
          this.score = this.score + 1;
          this.kick = false;
          //ball_transform = model_transform.times(Mat4.translation(55 , 2.2, 0)).times(Mat4.scale(0.5, 0.5, 0.5));
        }
        //ball_transform = ball_transform.times(Mat4.translation(3 * t, 0, 0));
        ball_transform = ball_transform.times(Mat4.rotation(-t, 0, 0.5, 1));
        //else
      } else {
        let _transform = model_transform
          .times(Mat4.translation(38, 0.5, 0))
          .times(Mat4.scale(1, 0.1, 0.1))
          .times(Mat4.translation(1, 1, 0));
        let point_transform = model_transform
          .times(Mat4.translation(39, 0.5, 0))
          .times(Mat4.rotation(Math.PI / 4, 0, 1, 0));
        this.shapes.cube.draw(
          context,
          program_state,
          _transform,
          this.materials.test.override({ color: hex_color('#F22431') })
        );
        this.shapes.triangle.draw(
          context,
          program_state,
          point_transform,
          this.materials.test.override({ color: hex_color('#F22431') })
        );
      }
      this.shapes.ball.draw(
        context,
        program_state,
        ball_transform,
        this.materials.ball
      );
    } else {
      let goal_transform = model_transform
        .times(Mat4.translation(55, 2.2, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
      this.shapes.ball.draw(
        context,
        program_state,
        goal_transform,
        this.materials.ball
      );
      console.log('You Scored!, Your total is now: ', this.score);
      this.goal = false;
    }
  }
  draw_ball_2(context, program_state)
  {
    if (!context.scratchpad.controls) {
      this.children.push(
          (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }
    program_state.projection_transform = Mat4.perspective(
        Math.PI / 4,
        context.width / context.height,
        0.1,
        1000
    );
    let t = program_state.animation_time / 1000,
        dt = program_state.animation_delta_time / 1000;

    let model_transform = Mat4.identity();

    let ball_transform = model_transform
        .times(Mat4.translation(38, 0.5, 0));
    ball_transform=ball_transform.times(Mat4.rotation(this.lr_angle,0,1,0));

    if (this.kick)
    {
      this.ball_in_air=true;
      this.time_of_kick=t;
      console.log("Kicked!");
      this.miss = false;
    }

    if (this.ball_in_air)
    {
      let curr_time=(t-this.time_of_kick)/2;

      console.log("Ball in Motion!");

      //Ball is on the ground
      if (this.ud_angle === 0)
      {
        let initial_velocity=this.power;
        let delta_x = initial_velocity*curr_time;
        ball_transform=ball_transform.times(Mat4.translation(delta_x,0,0));
      }
      else
      {
        let initial_velocity=this.power;
        let initial_velocity_x=initial_velocity*Math.cos(this.ud_angle)
        let initial_velocity_y = initial_velocity*Math.sin(this.ud_angle);

        let gravity = this.gravity;

        let delta_x = initial_velocity_x*curr_time;
        let delta_y=(-0.5*gravity*curr_time*curr_time)+(initial_velocity_y*curr_time);

        ball_transform=ball_transform.times(Mat4.translation(delta_x,delta_y,0));
      }
      if (ball_transform.valueOf()[0][3] > 50.0 && ball_transform.valueOf()[1][3] < 5.6
          && ball_transform.valueOf()[2][3] < 10
          && ball_transform.valueOf()[2][3] > -10) {
          console.log(ball_transform.valueOf()[2][3]);
          console.log(this.goalie_position);
          //if goalie legs height, then use width of legs, if arms, use arm width, if head use only head width
          // widths need to be checked with Tony
            if(ball_transform.valueOf()[1][3] < 1.2 && ball_transform.valueOf()[2][3] < (this.goalie_position+1)
                && ball_transform.valueOf()[2][3] > (this.goalie_position -1))
            {
                this.resetGoalState();
                this.ball_in_air = false;
                this.miss = true;
                console.log("SAVED");
            }
            else if(ball_transform.valueOf()[1][3] > 1.2 && ball_transform.valueOf()[1][3] < 3.2
                && ball_transform.valueOf()[2][3] < (this.goalie_position - 1.6)
                && ball_transform.valueOf()[2][3] > (this.goalie_position + 1.6)){
              this.resetGoalState();
              this.ball_in_air = false;
              this.miss = true;
              console.log("SAVED");
            }
            else if(ball_transform.valueOf()[1][3] > 3.2 && ball_transform.valueOf()[1][3] < 4.2
                && ball_transform.valueOf()[2][3] < (this.goalie_position - 0.5)
                && ball_transform.valueOf()[2][3] > (this.goalie_position + 0.5)){

            }
            else{
                this.goal = true;
                this.score = this.score + 1;
                this.resetGoalState();
                this.ball_in_air = false;
            }
        //ball_transform = model_transform.times(Mat4.translation(55 , 2.2, 0)).times(Mat4.scale(0.5, 0.5, 0.5));
      }
      else if(ball_transform.valueOf()[0][3] > 50.0 && ball_transform.valueOf()[1][3] > 5.6 ||
          ball_transform.valueOf()[0][3] > 50.0 && ball_transform.valueOf()[2][3] > 10
          || ball_transform.valueOf()[0][3] > 50.0 && ball_transform.valueOf()[2][3] < -10){
        this.resetGoalState();
        this.ball_in_air = false;
        this.miss = true;
      }
    }
    else{
      this.shapes.cube.draw(
          context,
          program_state,
          this._transform,
          this.materials.test.override({ color: hex_color('#F22431') }));
      this.shapes.cone.draw(context, program_state,
          this.point_transform,
          this.materials.test.override({ color: hex_color('#F22431') }));
    }


    this.kick=false;

    ball_transform=ball_transform.times(Mat4.scale(0.5,0.5,0.5));

    this.shapes.ball.draw(
        context,
        program_state,
        ball_transform,
        this.materials.ball
    );

  }

  draw_goal(context, program_state) {
    let model_transform = Mat4.identity();
    let stand_color = color(0.298, 0.298, 0.298, 1);
    let goalpost1_transform = model_transform
      .times(Mat4.translation(50, 0, 10))
      .times(Mat4.rotation(-Math.PI / 4, 0, 1, 0))
      .times(Mat4.translation(0, 2.7, 0))
      .times(Mat4.scale(0.2, 2.7, 0.2));
    this.shapes.cube.draw(
      context,
      program_state,
      goalpost1_transform,
      this.materials.sun.override({ color: hex_color('ffffff') })
    );
    let goalpost2_transform = model_transform
      .times(Mat4.translation(50, 0, -10))
      .times(Mat4.rotation(-Math.PI / 4, 0, 1, 0))
      .times(Mat4.translation(0, 2.7, 0))
      .times(Mat4.scale(0.2, 2.7, 0.2));
    this.shapes.cube.draw(
      context,
      program_state,
      goalpost2_transform,
      this.materials.sun.override({ color: hex_color('ffffff') })
    );
    let goalbar_transform = model_transform
      .times(Mat4.translation(50, 0, 0))
      .times(Mat4.translation(0, 5.6, 0))
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(0.2, 10, 0.2));
    this.shapes.cube.draw(
      context,
      program_state,
      goalbar_transform,
      this.materials.sun.override({ color: hex_color('ffffff') })
    );
  }

  draw_player(context, program_state, start_transform, animation) {
    const leg_length = 1.2;
    const leg_width = 0.8;
    const leg_offset = 0.1;

    const body_width = 2;
    const body_height = 2;
    const body_thickness = 1;

    const arm_width = 0.6;
    const arm_length = 2;

    const head_width = 1;
    const head_height = 1;

    const animation_speed = 2;

    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;

    // whole body animation
    if (animation === 'running') {
      start_transform = start_transform
        //   .times(Mat4.translation(0, 0, 2 * animation_speed * t))
        .times(Mat4.rotation((1 / 4) * Math.sin(animation_speed * t), 0, 1, 0))
        .times(
          Mat4.rotation(-(1 / 10) * Math.sin(animation_speed * t), 1, 0, 1)
        );
    }

    if (animation == 'kicking') {
      start_transform = start_transform
        .times(Mat4.rotation(-(1 / 4) * Math.sin(animation_speed * t), 0, 1, 0))
        .times(Mat4.rotation((1 / 4) * Math.sin(animation_speed * t), 1, 0, 0));
    }

      if (animation == 'defending') {
          start_transform = start_transform.times(
              Mat4.translation(
                  0,
                  -1 / 10 + -(1 / 10) * Math.sin(animation_speed * t),
                  0
              )
          );
      }

    // left leg
    // final position
    let leftLeg_transform = start_transform.times(
      Mat4.translation(-1 - leg_offset, 0, 0)
    );

    // animations
    if (animation == 'running') {
      leftLeg_transform = leftLeg_transform
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(Mat4.rotation(Math.sin(animation_speed * t), 1, 0, 0))
        .times(Mat4.translation(0, -2 * leg_length, 0));
      // -------------------
    }

    if (animation == 'kicking') {
      leftLeg_transform = leftLeg_transform
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(Mat4.rotation(2 * Math.sin(animation_speed * t), 1, 0, 0))
        .times(Mat4.translation(0, -2 * leg_length, 0));
      // -------------------
    }

      if (animation == 'defending') {
          leftLeg_transform = leftLeg_transform
              .times(Mat4.translation(0, 2 * leg_length, 0))
              .times(
                  Mat4.rotation(
                      -1 / 10 + -(1 / 10) * Math.sin(animation_speed * t),
                      0,
                      0,
                      1
                  )
              )
              .times(Mat4.translation(0, -2 * leg_length, 0));
          // -------------------
      }

    // model scaling
    leftLeg_transform = leftLeg_transform
      .times(Mat4.scale(leg_width, leg_length, leg_width))
      .times(Mat4.translation(0, 1, 0));

    this.shapes.cube.draw(
      context,
      program_state,
      leftLeg_transform,
      this.materials.test
    );

    leftLeg_transform = leftLeg_transform
      .times(Mat4.translation(0, -1, 0))
      .times(Mat4.scale(1 / leg_width, 1 / leg_length, 1 / leg_width));

    // left foot
    let leftFoot_transform = leftLeg_transform
      .times(Mat4.translation(0, 0, 0.6 * leg_width))

      .times(Mat4.scale(leg_width, 0.2, 1.2 * leg_width))
      .times(Mat4.translation(0, 1, 0));

    this.shapes.cube.draw(
      context,
      program_state,
      leftFoot_transform,
      this.materials.test
    );

    // right leg
    // left leg
    // final position
    let rightLeg_transform = start_transform.times(
      Mat4.translation(1 + leg_offset, 0, 0)
    );

    // animations
    if (animation == 'running') {
      rightLeg_transform = rightLeg_transform
        // rotation animation
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(Mat4.rotation(-Math.sin(animation_speed * t), 1, 0, 0))
        .times(Mat4.translation(0, -2 * leg_length, 0));
      // -------------------
    }

    if (animation == 'kicking') {
      rightLeg_transform = rightLeg_transform
        // rotation animation
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(Mat4.rotation(-(1 / 2) * Math.sin(animation_speed * t), 1, 0, 0))
        .times(Mat4.translation(0, -2 * leg_length, 0));
      // -------------------
    }

      if (animation == 'defending') {
          rightLeg_transform = rightLeg_transform
              // rotation animation
              .times(Mat4.translation(0, 2 * leg_length, 0))
              .times(
                  Mat4.rotation(
                      1 / 10 + (1 / 10) * Math.sin(animation_speed * t),
                      0,
                      0,
                      1
                  )
              )
              .times(Mat4.translation(0, -2 * leg_length, 0));
          // -------------------
      }

    // model scaling
    rightLeg_transform = rightLeg_transform
      .times(Mat4.scale(leg_width, leg_length, leg_width))
      .times(Mat4.translation(0, 1, 0));

    this.shapes.cube.draw(
      context,
      program_state,
      rightLeg_transform,
      this.materials.test
    );

    rightLeg_transform = rightLeg_transform
      .times(Mat4.translation(0, -1, 0))
      .times(Mat4.scale(1 / leg_width, 1 / leg_length, 1 / leg_width));

    // right foot
    let rightFoot_transform = rightLeg_transform
      .times(Mat4.translation(0, 0, 0.6 * leg_width))

      .times(Mat4.scale(leg_width, 0.2, 1.2 * leg_width))
      .times(Mat4.translation(0, 1, 0));
    this.shapes.cube.draw(
      context,
      program_state,
      rightFoot_transform,
      this.materials.test
    );

    // left butt cheek
    let leftButtCheek_transform = start_transform
      .times(Mat4.translation(-1, leg_length * 2, -body_thickness / 2))
      .times(Mat4.scale(body_thickness, body_thickness, body_thickness));
    this.shapes.sphere.draw(
      context,
      program_state,
      leftButtCheek_transform,
      this.materials.test
    );

    // right butt cheek
    let rightButtCheek_transform = start_transform
      .times(Mat4.translation(1, leg_length * 2, -body_thickness / 2))
      .times(Mat4.scale(body_thickness, body_thickness, body_thickness));
    this.shapes.sphere.draw(
      context,
      program_state,
      rightButtCheek_transform,
      this.materials.test
    );

    // body
    let body_transform = start_transform
      .times(Mat4.translation(0, body_height + leg_length * 2, 0))
      .times(Mat4.scale(body_width, body_height, body_thickness));
    this.shapes.cube.draw(
      context,
      program_state,
      body_transform,
      this.materials.test
    );

    // left arm
    // final position
    let leftArm_transform = start_transform.times(
      Mat4.translation(
        -body_width - arm_width,
        2 * leg_length + 2 * body_height - arm_length,
        0
      )
    );

    // animation
    if (animation == 'running') {
      leftArm_transform = leftArm_transform
        .times(Mat4.translation(0, arm_length * 0.8, 0))
        .times(Mat4.rotation(-Math.sin(animation_speed * t), 1, 0, 0))
        .times(Mat4.translation(0, -arm_length * 0.8, 0));
      // -----------------
    }
    if (animation == 'kicking') {
      leftArm_transform = leftArm_transform
        .times(Mat4.translation(0, arm_length * 0.8, 0))
        .times(Mat4.rotation(Math.sin(animation_speed * t), 1, 1, 0))
        .times(Mat4.translation(0, -arm_length * 0.8, 0));
      // -----------------
    }

      if (animation == 'defending') {
          leftArm_transform = leftArm_transform
              .times(Mat4.translation(0, arm_length * 0.8, 0))
              .times(
                  Mat4.rotation(
                      -1 / 5 + (-1 / 5) * Math.sin(animation_speed * t),
                      0,
                      0,
                      1
                  )
              )
              .times(Mat4.translation(0, -arm_length * 0.8, 0));
          // -----------------
      }

    // model scaling
    leftArm_transform = leftArm_transform.times(
      Mat4.scale(arm_width, arm_length, arm_width)
    );

    this.shapes.cube.draw(
      context,
      program_state,
      leftArm_transform,
      this.materials.test
    );

    // right arm
    let rightArm_transform = start_transform.times(
      Mat4.translation(
        body_width + arm_width,
        2 * leg_length + 2 * body_height - arm_length,
        0
      )
    );

    // animation
    if (animation == 'running') {
      rightArm_transform = rightArm_transform
        .times(Mat4.translation(0, arm_length * 0.8, 0))
        .times(Mat4.rotation(Math.sin(animation_speed * t), 1, 0, 0))
        .times(Mat4.translation(0, -arm_length * 0.8, 0));
      // -----------------
    }
    if (animation == 'kicking') {
      rightArm_transform = rightArm_transform
        .times(Mat4.translation(0, arm_length * 0.8, 0))
        .times(Mat4.rotation(Math.sin(animation_speed * t), -1, 1, 0))
        .times(Mat4.translation(0, -arm_length * 0.8, 0));
      // -----------------
    }

      if (animation == 'defending') {
          rightArm_transform = rightArm_transform
              .times(Mat4.translation(0, arm_length * 0.8, 0))
              .times(
                  Mat4.rotation(
                      1 / 5 + (1 / 5) * Math.sin(animation_speed * t),
                      0,
                      0,
                      1
                  )
              )
              .times(Mat4.translation(0, -arm_length * 0.8, 0));
          // -----------------
      }

    // model scaling
    rightArm_transform = rightArm_transform.times(
      Mat4.scale(arm_width, arm_length, arm_width)
    );

    this.shapes.cube.draw(
      context,
      program_state,
      rightArm_transform,
      this.materials.test
    );

    // head
    let head_transform = start_transform
      .times(
        Mat4.translation(0, 1 + leg_length + body_height * 2 + head_height, 0)
      )
      .times(Mat4.scale(head_width, head_height, head_width));
    this.shapes.cube.draw(
      context,
      program_state,
      head_transform,
      this.materials.test
    );
  }

  display(context, program_state) {
      const t = program_state.animation_time / 1000,
          dt = program_state.animation_delta_time / 1000;

      this.draw_stadium(context, program_state);
    this.billboard(context, program_state);
    this.draw_goal(context, program_state);
    this.draw_ball_2(context, program_state);
    let start_transform = Mat4.identity();
      if (this.isGoalieRandom) {
          if (this.goalie_random_timer > this.goalieDirChangeFrequency) {
              this.goalie_direction = Math.random() < 0.5 ? -1 : 1;
              this.goalie_random_timer = 0;
          }
          this.goalie_random_timer += dt;
      }
      if (this.goalie_position > 8) {
          this.goalie_direction = -1;
      } else if (this.goalie_position < -8) {
          this.goalie_direction = 1;
      }
      this.goalie_position += this.goalie_direction * this.goalie_speed * dt;

    start_transform = start_transform
      .times(Mat4.translation(49, 0, this.goalie_position))
      .times(Mat4.rotation(-1.5, 0, 1, 0))
      .times(Mat4.scale(1 / 2, 1 / 2, 1 / 2));
    this.draw_player(context, program_state, start_transform, 'defending');

    start_transform = Mat4.identity();
    start_transform = start_transform
      .times(Mat4.translation(35, 0, -2))
      .times(Mat4.rotation(1.2, 0, 1, 0))
      .times(Mat4.scale(1 / 2, 1 / 2, 1 / 2));
    if(this.kick){
        this.draw_player(context, program_state, start_transform, 'kicking');
    }
    else{
        this.draw_player(context, program_state, start_transform, '');
    }

  }
  
}

class Gouraud_Shader extends Shader {
  // This is a Shader using Phong_Shader as template
  // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
      ` 
        precision mediump float;
        const int N_LIGHTS = ` +
      this.num_lights +
      `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;

        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `
    );
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
                vertex_color.xyz += phong_model_lights(N, vertex_worldspace);
            } `
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
            void main(){
                gl_FragColor = vertex_color;
                return;
            } `
    );
  }

  send_material(gl, gpu, material) {
    // send_material(): Send the desired shape-wide material qualities to the
    // graphics card, where they will tweak the Phong lighting formula.
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    // send_gpu_state():  Send the state of our whole drawing context to the GPU.
    const O = vec4(0, 0, 0, 1),
      camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
    const squared_scale = model_transform
      .reduce((acc, r) => {
        return acc.plus(vec4(...r).times_pairwise(r));
      }, vec4(0, 0, 0, 0))
      .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.
    const PCM = gpu_state.projection_transform
      .times(gpu_state.camera_inverse)
      .times(model_transform);
    gl.uniformMatrix4fv(
      gpu.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    gl.uniformMatrix4fv(
      gpu.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );

    // Omitting lights will show only the material color, scaled by the ambient term:
    if (!gpu_state.lights.length) return;

    const light_positions_flattened = [],
      light_colors_flattened = [];
    for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
      light_positions_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].position[i % 4]
      );
      light_colors_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].color[i % 4]
      );
    }
    gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
    gl.uniform4fv(gpu.light_colors, light_colors_flattened);
    gl.uniform1fv(
      gpu.light_attenuation_factors,
      gpu_state.lights.map((l) => l.attenuation)
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.

    // Fill in any missing fields in the Material object with custom defaults for this shader:
    const defaults = {
      color: color(0, 0, 0, 1),
      ambient: 0,
      diffusivity: 1,
      specularity: 1,
      smoothness: 40,
    };
    material = Object.assign({}, defaults, material);

    this.send_material(context, gpu_addresses, material);
    this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
  }
}

class Ring_Shader extends Shader {
  update_GPU(
    context,
    gpu_addresses,
    graphics_state,
    model_transform,
    material
  ) {
    // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
    const [P, C, M] = [
        graphics_state.projection_transform,
        graphics_state.camera_inverse,
        model_transform,
      ],
      PCM = P.times(C).times(M);
    context.uniformMatrix4fv(
      gpu_addresses.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    context.uniformMatrix4fv(
      gpu_addresses.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    return (
      this.shared_glsl_code() +
      `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
          point_position = model_transform * vec4(position, 1.0);
          gl_Position = projection_camera_model_transform * vec4(position, 1.0);          
        }`
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    return (
      this.shared_glsl_code() +
      `
        void main(){
            float scalar = sin(18.01 * distance(point_position.xyz, center.xyz));
            gl_FragColor = scalar * vec4(0.6078, 0.3961, 0.098, 1.0);
        }`
    );
  }
}