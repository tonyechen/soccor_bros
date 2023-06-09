import { defs, tiny } from './examples/common.js';
import { Text_Line } from './examples/text-demo.js';

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
const { Textured_Phong} = defs;

export class SoccorBro extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      sphere: new defs.Subdivision_Sphere(4),
      square: new defs.Square(),
      cube: new defs.Cube(),
      ball: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(
          3
      ),
      cone: new defs.Cone_Tip(3, 3, [0, 1]),
      guide: new defs.Axis_Arrows(),
      triangle: new defs.Triangle(),
      text: new Text_Line(35),
    };

    // *** Materials
    this.materials = {
      test: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color('#ffffff'),
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
        texture: new Texture('assets/soccer-field.jpg'),
      }),
      background: new Material(new Textured_Phong(), {
        color: hex_color('#000000'),
        ambient: 1,
        diffusivity: 0.2,
        specularity: 0.2,
        texture: new Texture('assets/star_texture.jpg'),
      }),
      ball: new Material(new Textured_Phong(), {
        ambient: 1,
        diffusivity: 0.2,
        specularity: 0.2,
        color: hex_color('#000000'),
        texture: new Texture('assets/soccer_ball_texture.jpg'),
      }),
      concrete: new Material(new Textured_Phong(), {
        ambient: 1,
        diffusivity: 0.2,
        specularity: 0.2,
        color: hex_color('#000000'),
        texture: new Texture('assets/concrete_texture.jpg')
      }),

      planet: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0.2,
        specularity: 0.2,
        color: color(0.61,0.18,0.21,1),
      }),

      player_body: new Material(new Textured_Phong(), {
        color: hex_color('#000000'),
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture('assets/1.png'),
      }),

      player_legs: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#000000'),
      }),

      player_foot: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color('#062E5E'),
      }),

      player_arm: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        specularity: 0.8,
        color: hex_color('#062E5E'),
      }),

      player_head: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        specularity: 0,
        color: hex_color('#8D5524'),
      }),

      goalie_body: new Material(new Textured_Phong(), {
        color: hex_color('#000000'),
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture('assets/2.png'),
      }),

      goalie_legs: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#ffffff'),
      }),

      goalie_foot: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color('#FF0000'),
      }),

      goalie_arm: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        specularity: 0.8,
        color: hex_color('#ffffff'),
      }),

      goalie_head: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        specularity: 0,
        color: hex_color('#E0AC69'),
      }),
      text_image: new Material(new defs.Textured_Phong(1), {
        ambient: 1,
        diffusivity: 0,
        specularity: 0,
        texture: new Texture('assets/text.png'),
      }),
    };

    this.initial_camera_location = Mat4.look_at(
        vec3(-100, 100, 100),
        vec3(10, 0, 0),
        vec3(0, 1, 0)
    );

    this.shootout = Mat4.look_at(
        vec3(20, 8, 0),
        vec3(50, 0, 0),
        vec3(0, 1, 0));
    this.kick = false;
    this.ball_in_air = false;
    this.time_of_kick = 0;

    //The "power" of the kick is equivilant to the intitial velocity of the ball before it's projectile motion
    this.power = 20;
    //the lr (left-right) allows us to shift where the ball ends up on our kick along the horizontal
    this.lr_angle = 0;

    //the ud (up-down) allows us to shift where the ball ends up on our kick up and down
    this.ud_angle=0;
    this.miss = false;
    //The amount of gravity on our planet!
    this.gravity = 9.8;
    this.point_transform = Mat4.identity()
      .times(Mat4.translation(40, 0.8, 0.1))
      .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
      .times(Mat4.scale(0.5, 0.5, 0.5));
    this._transform = Mat4.identity()
      .times(Mat4.translation(38, 0.5, 0))
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
    this.goalie_isStill = true;

    this.player_kick_finish = true;
    this.player_kicked = true;
    this.player_kick_t = 0;

    this.game_started=false;

    this.ricochet =false;
    this.time_of_collision=0;
    this.ball_transform_at_collision = Mat4.identity();
    this.project = false;

    this.billboard_start_t = 0;
    this.billboard_on = false;
    this.billboard_message = '';
  }


  handleAngleUp() {
    //this.ud_prev = this.ud_angle;
    //Only update when the ball hasn't been kicked or when it's not in the air
    if (!this.ball_in_air && !this.kick && this.game_started) {
      //Increment the angle by 5 degrees
      this.ud_angle = this.ud_angle + 0.087;

      //If it's now over our limit (40 degrees), set it to it back down to 40 degrees
      if (this.ud_angle > 0.69) {
        this.ud_angle = 0.69;
      }
      console.log(this.ud_angle);

      this._transform = Mat4.identity()
        .times(Mat4.translation(38, 0.5, 0))
        .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
        .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
        .times(Mat4.scale(1, 0.1, 0.1))
        .times(Mat4.translation(1, 1, 0));

      this.point_transform = Mat4.identity()
        .times(Mat4.translation(37.7, 0.8, 0.1))
        .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
        .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
        .times(Mat4.translation(2.3, 0, 0))
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }
  handleAngleDown() {
    //Only update when the ball hasn't been kicked or when it's not in the air
    if (!this.ball_in_air && !this.kick && this.game_started) {
      //Decrement the angle by 5 degrees
      this.ud_angle = this.ud_angle - 0.087;

      //If it's below zero degrees, then set it back to our limit of zero
      if (this.ud_angle < 0.02) {
        this.ud_angle = 0;
      }

      this._transform = Mat4.identity()
        .times(Mat4.translation(38, 0.5, 0))
        .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
        .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
        .times(Mat4.scale(1, 0.1, 0.1))
        .times(Mat4.translation(1, 1, 0));
      this.point_transform = Mat4.identity()
        .times(Mat4.translation(37.7, 0.8, 0.1))
        .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
        .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
        .times(Mat4.translation(2.3, 0, 0))
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }
  handleAngleLeft() {
    //Only update when the ball hasn't been kicked or when it's not in the air
    if (!this.ball_in_air && !this.kick && this.game_started) {
      //Decrement the angle by 5 degrees
      this.lr_angle = this.lr_angle + 0.087;

      //If it's below zero degrees, then set it back to our limit of zero
      if (this.lr_angle > Math.PI / 4) {
        this.lr_angle = Math.PI / 4;
      }
      this._transform = Mat4.identity()
        .times(Mat4.translation(38, 0.5, 0))
        .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
        .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
        .times(Mat4.scale(1, 0.1, 0.1))
        .times(Mat4.translation(1, 1, 0));
      this.point_transform = Mat4.identity()
        .times(Mat4.translation(37.7, 0.8, 0.1))
        .times(Mat4.rotation(this.ud_angle, 0, 0, 1))
        .times(Mat4.rotation(this.lr_angle, 0, 1, 0))
        .times(Mat4.translation(2.3, 0, 0))
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(0.5, 0.5, 0.5));
    }
  }
  handleAngleRight() {
    if (!this.ball_in_air && !this.kick && this.game_started) {
      //Decrement the angle by 5 degrees
      this.lr_angle = this.lr_angle - 0.087;

      //If it's below zero degrees, then set it back to our limit of zero
      if (this.lr_angle < (-1 * Math.PI) / 4) {
        this.lr_angle = (-1 * Math.PI) / 4;
      }
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
  resetGoalState() {
    this.kick = false;
    this.ball_in_air = false;
    this.time_of_kick = 0;
    this.riochet =false;

    //The "power" of the kick is equivilant to the intitial velocity of the ball before it's projectile motion
    this.power = 20;
    //the lr (left-right) allows us to shift where the ball ends up on our kick along the horizontal
    this.lr_angle = 0;

    //the ud (up-down) allows us to shit where the ball ends up on our kick up and down
    this.ud_angle = 0;
    //The amount of gravity on our planet!
    this.gravity = 9.8;
    this.point_transform = Mat4.identity()
      .times(Mat4.translation(40, 0.8, 0.1))
      .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
      .times(Mat4.scale(0.5, 0.5, 0.5));
    this._transform = Mat4.identity()
      .times(Mat4.translation(38, 0.5, 0))
      .times(Mat4.scale(1, 0.1, 0.1))
      .times(Mat4.translation(1, 1, 0));
  }
  handleIncreasePower() {
    if (this.game_started)
    {
      this.power = this.power + 1;
      if (this.power > 40) {
        this.power = 40;
      }
    }

  }

  handleDecreasePower() {

    if (this.game_started) {
      this.power = this.power - 1;
      if (this.power < 5) {
        this.power = 5;
      }
    }
  }
  handleStartGame()
  {
    this.attached = () => this.shootout;
    this.game_started=true;

  }

  make_control_panel() {
    this.key_triggered_button(
        'kick',
        ['t'],
        () => (this.kick = !this.ball_in_air)
    );
    //99999999
    this.key_triggered_button('aim_up', ['9'], () => this.handleAngleUp());
    this.key_triggered_button('aim_down', ['8'], () => this.handleAngleDown());
    this.key_triggered_button('aim_left', ['7'], () => this.handleAngleLeft());
    this.key_triggered_button('aim_right', ['6'], () =>
      this.handleAngleRight()
    );

    this.key_triggered_button(
        'increase power',
        ['p'],
        () => this.handleIncreasePower()
    );
    this.key_triggered_button(
        'decrease power',
        ['q'],
        () => this.handleDecreasePower()
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
    this.key_triggered_button(`toggle goalie movement`, ['y'], () => {
      this.goalie_isStill = !this.goalie_isStill;
    });
    this.key_triggered_button(
        'start',
        ['b'],
        () => this.handleStartGame()
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

    let concerete_transform = model_transform
        .times(Mat4.translation(0, -1*(20.1), 0))
        .times(Mat4.scale(pitch_x_dim*1.5, 20, pitch_y_dim*1.5));
    this.shapes.cube.draw(
        context,
        program_state,
        concerete_transform,
        this.materials.concrete
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
    let planet_transform = model_transform.times(Mat4.scale(125,125,125)).times(Mat4.translation(0,-1,0));
    this.shapes.sphere.draw(context,program_state,planet_transform,this.materials.planet);

    let background_transform = model_transform.times(Mat4.scale(500,500,500));
    this.shapes.cube.draw(context,program_state,background_transform,this.materials.background);
  }

  billboard(context, program_state, text, offset_y){
    let text_transform = Mat4.identity()
        // .times(program_state.projection_transform)
        .times(Mat4.translation(5, 0.2 - offset_y / 3, - offset_y / 18 - 1))
        .times(Mat4.inverse(program_state.camera_inverse))
        .times(Mat4.scale(1 / 5, 1 / 5, 1 / 5));
    console.log("created at", text_transform);
    this.shapes.text.set_string(text, context.context);
    this.shapes.text.draw(
        context,
        program_state,
        text_transform,
        this.materials.text_image
    );
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

    let ball_transform = model_transform.times(Mat4.translation(38, 0.5, 0));

    if (this.kick && this.game_started) {
      this.ball_in_air = true;
      this.player_kick_t = t;
      this.player_kick_finish = false;
      this.player_kicked = false;
      this.miss = false;
    }

    if (this.ricochet)
    {
      let tsc = t-this.time_of_collision;
      ball_transform=this.ball_transform_at_collision;

      let delta_x = -1 * (8 * tsc);
      let delta_y = -0.5 * this.gravity * tsc * tsc;

      ball_transform = ball_transform.times(
          Mat4.translation(delta_x, delta_y, 0)
      );
      if (ball_transform.valueOf()[1][3] < 0.25)
      {
        this.resetGoalState();
        this.ball_in_air = false;
        this.miss = true;
        this.ricochet=false;
      }

    }

    if (this.ball_in_air && this.player_kicked) {
      ball_transform = ball_transform.times(
        Mat4.rotation(this.lr_angle, 0, 1, 0)
      );

      let curr_time = t - this.time_of_kick;
      //Ball is on the ground
      if (this.ud_angle === 0) {
        let initial_velocity = this.power;
        let delta_x = initial_velocity * curr_time;
        ball_transform = ball_transform.times(Mat4.translation(delta_x, 0, 0));
      } else {
        let initial_velocity = this.power;
        let initial_velocity_x = initial_velocity * Math.cos(this.ud_angle);
        let initial_velocity_y = initial_velocity * Math.sin(this.ud_angle);

        let gravity = this.gravity;

        let delta_x = initial_velocity_x * curr_time;
        let delta_y =
          -0.5 * gravity * curr_time * curr_time +
          initial_velocity_y * curr_time;

        ball_transform = ball_transform.times(
          Mat4.translation(delta_x, delta_y, 0)
        );
      }
      let pre_z_rotation_transform = ball_transform;
      let ball_rotation = 4 * Math.PI * curr_time * 2;
      ball_transform = ball_transform.times(
        Mat4.rotation(ball_rotation, 0, 0, 1)
      );

      //TOPBAR CODE IS THE BENEATH IF STATEMENT
      if (ball_transform.valueOf()[1][3] < 6.1 && ball_transform.valueOf()[1][3] > 5.1 && ball_transform.valueOf()[0][3] > 49.0 && ball_transform.valueOf()[0][3] < 49.5 && ball_transform.valueOf()[2][3]>-10 && ball_transform.valueOf()[2][3]<10)
      {
        console.log('hit crossbar');
        console.log('DOINKED');
        this.billboard_on = true;
        this.billboard_message = 'DOINKED';
        this.billboard_start_t = t;
        this.ball_in_air = false;
        this.miss = true;
        this.ricochet=true;
        this.ball_transform_at_collision = pre_z_rotation_transform;
        this.time_of_collision=t;
      }
      else if(ball_transform.valueOf()[1][3] < 6.1  && ball_transform.valueOf()[0][3] > 48.5
          && ball_transform.valueOf()[0][3] < 49.0
          && ((ball_transform.valueOf()[2][3]>-10 && ball_transform.valueOf()[2][3]<-8) ||
              (ball_transform.valueOf()[2][3]>8 && ball_transform.valueOf()[2][3]<10))){
        console.log('hit post');
        console.log('DOINKED');
        this.billboard_on = true;
        this.billboard_message = 'DOINKED';
        this.billboard_start_t = t;        this.ball_in_air = false;
        this.miss = true;
        this.ricochet=true;
        this.ball_transform_at_collision = pre_z_rotation_transform;
        this.time_of_collision=t;
      }
      else if (
        ball_transform.valueOf()[0][3] > 48.5 &&
        ball_transform.valueOf()[1][3] < 5.6 &&
        ball_transform.valueOf()[2][3] < 10 &&
        ball_transform.valueOf()[2][3] > -10
      ) {
        //if goalie legs height, then use width of legs, if arms, use arm width, if head use only head width
        // widths need to be checked with Tony
        if (
          ball_transform.valueOf()[1][3] < 1.2 &&
          ball_transform.valueOf()[2][3] < this.goalie_position + 1 &&
          ball_transform.valueOf()[2][3] > this.goalie_position - 1
        ) {
          console.log('hit legs');
          console.log('SAVED');
          this.billboard_on = true;
          this.billboard_message = 'SAVED!';
          this.billboard_start_t = t;
          this.ball_in_air = false;
          this.miss = true;
            this.ricochet=true;
            this.ball_transform_at_collision = pre_z_rotation_transform;
            this.time_of_collision=t;

        } else if (
          ball_transform.valueOf()[1][3] > 1.2 &&
          ball_transform.valueOf()[1][3] < 3.2 &&
          ball_transform.valueOf()[2][3] < this.goalie_position + 2 &&
          ball_transform.valueOf()[2][3] > this.goalie_position - 2
        ) {
          console.log('hit body');
          console.log('SAVED');
          this.billboard_on = true;
          this.billboard_message = 'SAVED!';
          this.billboard_start_t = t;
          this.ball_in_air = false;
          this.miss = true;
          if (this.ud_angle === 0)
          {
            this.resetGoalState();
          }
          else
          {
            this.ricochet=true;
            this.ball_transform_at_collision = pre_z_rotation_transform;
            this.time_of_collision=t;
          }

        } else if (
          ball_transform.valueOf()[1][3] > 3.2 &&
          ball_transform.valueOf()[1][3] < 4.2 &&
          ball_transform.valueOf()[2][3] < this.goalie_position + 0.5 &&
          ball_transform.valueOf()[2][3] > this.goalie_position - 0.5
        ) {
          console.log('hit head');
          console.log('SAVED');
          this.billboard_on = true;
          this.billboard_message = 'SAVED!';
          this.billboard_start_t = t;
          this.ball_in_air = false;
          this.miss = true;
          if (this.ud_angle === 0)
          {
            this.resetGoalState();
          }
          else
          {
            this.ricochet=true;
            this.ball_transform_at_collision = pre_z_rotation_transform;
            this.time_of_collision=t;
          }
        }
        else {
          this.goal = true;
          this.score = this.score + 1;
          this.resetGoalState();
          this.ball_in_air = false;
          console.log('scored!');
          this.billboard_on = true;
          this.billboard_message = 'SCORED!';
          this.billboard_start_t = t;
        }
        //ball_transform = model_transform.times(Mat4.translation(55 , 2.2, 0)).times(Mat4.scale(0.5, 0.5, 0.5));
      } else if (
        (ball_transform.valueOf()[0][3] > 50.0 &&
          ball_transform.valueOf()[1][3] > 5.6) ||
        (ball_transform.valueOf()[0][3] > 50.0 &&
          ball_transform.valueOf()[2][3] > 10) ||
        (ball_transform.valueOf()[0][3] > 50.0 &&
          ball_transform.valueOf()[2][3] < -10)
      ) {
        this.resetGoalState();
        this.ball_in_air = false;
        this.miss = true;
        console.log('MISSED');
        this.billboard_on = true;
        this.billboard_message = 'MISSED';
        this.billboard_start_t = t;
      }
      else if (ball_transform.valueOf()[1][3] < 0.25 && this.ud_angle !== 0)
      {
        this.resetGoalState();
        this.ball_in_air = false;
        this.miss = true;
        console.log('MISSED by not reaching goal');
        this.billboard_on = true;
        this.billboard_message = 'SHANKED';
        this.billboard_start_t = t;
      }
    }
    else if (!this.ricochet){
      this.shapes.cube.draw(
        context,
        program_state,
        this._transform,
        this.materials.test.override({ color: hex_color('#F22431') })
      );
      this.shapes.cone.draw(
        context,
        program_state,
        this.point_transform,
        this.materials.test.override({ color: hex_color('#F22431') })
      );
    }

    this.kick = false;

    ball_transform = ball_transform.times(Mat4.scale(0.5, 0.5, 0.5));
    //console.log(ball_transform)
    this.shapes.ball.draw(
      context,
      program_state,
      ball_transform,
      this.materials.ball
    );

  }

  draw_goal(context, program_state) {
    let model_transform = Mat4.identity();

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

  draw_player(context, program_state, start_transform, types, animation) {
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

    const animation_speed = 4;

    const t = program_state.animation_time / 1000,
        dt = program_state.animation_delta_time / 1000;

    // whole body animation
    if (animation === 'running') {
      start_transform = start_transform
        //   .times(Mat4.translation(0, 0, 2 * animation_speed * t))
        .times(
          Mat4.rotation(
            (1 / 4) * Math.sin(animation_speed * (t - this.player_kick_t)),
            0,
            1,
            0
          )
        )
        .times(
          Mat4.rotation(
            -(1 / 10) * Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            1
          )
        );
    }

    if (animation == 'kicking') {
      start_transform = start_transform
        .times(
          Mat4.rotation(
            -(1 / 4) * Math.sin(animation_speed * (t - this.player_kick_t)),
            0,
            1,
            0
          )
        )
        .times(
          Mat4.rotation(
            (1 / 4) * Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        );
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
        .times(
          Mat4.rotation(
            Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        )
        .times(Mat4.translation(0, -2 * leg_length, 0));
      // -------------------
    }

    if (animation == 'kicking') {
      leftLeg_transform = leftLeg_transform
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(
          Mat4.rotation(
            2 * Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        )
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

    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        leftLeg_transform,
        this.materials.player_legs
      );
    }

    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        leftLeg_transform,
        this.materials.goalie_legs
      );
    }

    leftLeg_transform = leftLeg_transform
        .times(Mat4.translation(0, -1, 0))
        .times(Mat4.scale(1 / leg_width, 1 / leg_length, 1 / leg_width));

    // left foot
    let leftFoot_transform = leftLeg_transform
      .times(Mat4.translation(0, 0, 0.2 * leg_width))

      .times(Mat4.scale(1.1 * leg_width, 0.2, 1.3 * leg_width))
      .times(Mat4.translation(0, 1, 0));

    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        leftFoot_transform,
        this.materials.player_foot
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        leftFoot_transform,
        this.materials.goalie_foot
      );
    }

    // right leg
    // final position
    let rightLeg_transform = start_transform.times(
        Mat4.translation(1 + leg_offset, 0, 0)
    );

    // animations
    if (animation == 'running') {
      rightLeg_transform = rightLeg_transform
        // rotation animation
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(
          Mat4.rotation(
            -Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        )
        .times(Mat4.translation(0, -2 * leg_length, 0));
      // -------------------
    }

    if (animation == 'kicking') {
      rightLeg_transform = rightLeg_transform
        // rotation animation
        .times(Mat4.translation(0, 2 * leg_length, 0))
        .times(
          Mat4.rotation(
            -(1 / 2) * Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        )
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

    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        rightLeg_transform,
        this.materials.player_legs
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        rightLeg_transform,
        this.materials.goalie_legs
      );
    }

    rightLeg_transform = rightLeg_transform
        .times(Mat4.translation(0, -1, 0))
        .times(Mat4.scale(1 / leg_width, 1 / leg_length, 1 / leg_width));

    // right foot
    let rightFoot_transform = rightLeg_transform
      .times(Mat4.translation(0, 0, 0.2 * leg_width))

      .times(Mat4.scale(1.1 * leg_width, 0.2, 1.4 * leg_width))
      .times(Mat4.translation(0, 1, 0));
    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        rightFoot_transform,
        this.materials.player_foot
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        rightFoot_transform,
        this.materials.goalie_foot
      );
    }

    // left butt cheek
    let leftButtCheek_transform = start_transform
      .times(Mat4.translation(-1, leg_length * 2, -body_thickness / 2))
      .times(Mat4.scale(body_thickness, body_thickness, body_thickness));

    if (types == 'player') {
      this.shapes.sphere.draw(
        context,
        program_state,
        leftButtCheek_transform,
        this.materials.player_legs
      );
    }
    if (types == 'goalie') {
      this.shapes.sphere.draw(
        context,
        program_state,
        leftButtCheek_transform,
        this.materials.goalie_legs
      );
    }

    // right butt cheek
    let rightButtCheek_transform = start_transform
      .times(Mat4.translation(1, leg_length * 2, -body_thickness / 2))
      .times(Mat4.scale(body_thickness, body_thickness, body_thickness));
    if (types == 'player') {
      this.shapes.sphere.draw(
        context,
        program_state,
        rightButtCheek_transform,
        this.materials.player_legs
      );
    }
    if (types == 'goalie') {
      this.shapes.sphere.draw(
        context,
        program_state,
        rightButtCheek_transform,
        this.materials.goalie_legs
      );
    }

    // body
    let body_transform = start_transform
      .times(Mat4.translation(0, body_height + leg_length * 2, 0))
      .times(Mat4.scale(body_width, body_height, body_thickness));

    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        body_transform,
        this.materials.player_body
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        body_transform,
        this.materials.goalie_body
      );
    }

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
        .times(
          Mat4.rotation(
            -Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        )
        .times(Mat4.translation(0, -arm_length * 0.8, 0));
      // -----------------
    }
    if (animation == 'kicking') {
      leftArm_transform = leftArm_transform
        .times(Mat4.translation(0, arm_length * 0.8, 0))
        .times(
          Mat4.rotation(
            Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            1,
            0
          )
        )
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
    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        leftArm_transform,
        this.materials.player_arm
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        leftArm_transform,
        this.materials.goalie_arm
      );
    }

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
        .times(
          Mat4.rotation(
            Math.sin(animation_speed * (t - this.player_kick_t)),
            1,
            0,
            0
          )
        )
        .times(Mat4.translation(0, -arm_length * 0.8, 0));
      // -----------------
    }
    if (animation == 'kicking') {
      rightArm_transform = rightArm_transform
        .times(Mat4.translation(0, arm_length * 0.8, 0))
        .times(
          Mat4.rotation(
            Math.sin(animation_speed * (t - this.player_kick_t)),
            -1,
            1,
            0
          )
        )
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
    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        rightArm_transform,
        this.materials.player_arm
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        rightArm_transform,
        this.materials.goalie_arm
      );
    }

    // head
    let head_transform = start_transform
      .times(
        Mat4.translation(0, 1 + leg_length + body_height * 2 + head_height, 0)
      )
      .times(Mat4.scale(head_width, head_height, head_width));
    if (types == 'player') {
      this.shapes.cube.draw(
        context,
        program_state,
        head_transform,
        this.materials.player_head
      );
    }
    if (types == 'goalie') {
      this.shapes.cube.draw(
        context,
        program_state,
        head_transform,
        this.materials.goalie_head
      );
    }
  }

  draw_text(context, program_state, text, offset_y) {
    // offset_y is the line number
  if(this.attached !== undefined){
    // fix text to the camera
    let text_transform = Mat4.identity()
        // .times(program_state.projection_transform)
        .times(Mat4.translation(5, 0.5 - offset_y / 3, -3.2 - offset_y / 18))
        .times(Mat4.inverse(program_state.camera_inverse))
        .times(Mat4.scale(1 / 10, 1 / 10, 1 / 10));
    this.shapes.text.set_string(text, context.context);
    this.shapes.text.draw(
        context,
        program_state,
        text_transform,
        this.materials.text_image
    );
    }
  else{
    let text_transform = Mat4.identity()
        // .times(program_state.projection_transform)
        .times(Mat4.translation(5, 0.5 - offset_y / 3, -8 - offset_y / 18))
        .times(Mat4.inverse(program_state.camera_inverse))
        .times(Mat4.scale(1 / 5, 1 / 5, 1 / 5));
    this.shapes.text.set_string(text, context.context);
    this.shapes.text.draw(
        context,
        program_state,
        text_transform,
        this.materials.text_image
    );
  }
  }

  display(context, program_state) {
    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;

    this.draw_stadium(context, program_state);
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

    if (this.goalie_isStill) {
      this.goalie_position = 0;
    }
    else {
      this.goalie_position += this.goalie_direction * this.goalie_speed * dt;
    }

    start_transform = start_transform
      .times(Mat4.translation(49, 0, this.goalie_position))
      .times(Mat4.rotation(-1.5, 0, 1, 0))
      .times(Mat4.scale(1 / 2, 1 / 2, 1 / 2));
    this.draw_player(
      context,
      program_state,
      start_transform,
      'goalie',
      'defending'
    );

    // player
    start_transform = Mat4.identity();
    start_transform = start_transform
      .times(Mat4.translation(35, 0, -2))
      .times(Mat4.rotation(1.2, 0, 1, 0))
      .times(Mat4.scale(1 / 2, 1 / 2, 1 / 2));

    if (!this.player_kick_finish) {
      let kick_animation_t = t - this.player_kick_t;;
      start_transform = start_transform.times(
        Mat4.translation(-kick_animation_t / 4, 0, 2 * kick_animation_t)
      );
      if (kick_animation_t < 1.57) {
        this.draw_player(
          context,
          program_state,
          start_transform,
          'player',
          'running'
        );
      } else if (kick_animation_t < 2.355) {
        this.draw_player(
          context,
          program_state,
          start_transform,
          'player',
          'kicking'
        );
      } else if (kick_animation_t < 3.14) {
        this.player_kicked = true;
        this.time_of_kick = this.player_kick_t + 2.355;
        this.draw_player(
          context,
          program_state,
          start_transform,
          'player',
          'kicking'
        );
      } else {
        this.player_kick_finish = true;
      }
    } else {
      this.draw_player(context, program_state, start_transform, 'player', '');
    }
    if (this.attached !== undefined) {
      // Blend desired camera position with existing camera matrix (from previous frame) to smoothly pull camera towards planet
      program_state.camera_inverse = this.attached().map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
      //program_state.set_camera(this.shootout);
      this.draw_text(context, program_state, `score: ${this.score}`, 0);
      this.draw_text(context, program_state, `power: ${this.power}`, 1);
      this.draw_text(
          context,
          program_state,
          `angle Y: ${Math.floor((this.ud_angle / 3.14) * 180)}`,
          2
      );
      this.draw_text(
          context,
          program_state,
          `angle X: ${Math.floor((this.lr_angle / 3.14) * 180)}`,
          3
      );

    }
    else{
      this.draw_text(context, program_state, `Press b to start`, 20);
    }

    if (this.billboard_on && t - this.billboard_start_t < 0.5) {
        this.billboard(context, program_state, this.billboard_message, 0);
    } else {
      this.billboard_on = false;
    }
  }
}
