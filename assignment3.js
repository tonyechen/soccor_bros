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
} = tiny;

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
      // TODO:  Fill in as many additional shape instances as needed in this key/value table.
      //        (Requirement 1)
      sun: new defs.Subdivision_Sphere(4),
      planet1:
        new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
      planet2: new defs.Subdivision_Sphere(3),
      planet3: new defs.Subdivision_Sphere(4),
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
      // TODO:  Fill in as many additional material objects as needed in this key/value table.
      //        (Requirement 4)
      // Default ambient lighting: 0
      planet1: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 1,
        color: hex_color('#808080'),
        specularity: 0,
      }),
      planet2_g: new Material(new Gouraud_Shader(), {
        ambient: 0,
        diffusivity: 0.2,
        color: hex_color('#80FFFF'),
        specularity: 1,
      }),
      planet2_p: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 0.2,
        color: hex_color('#80FFFF'),
        specularity: 1,
      }),
      planet3: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 1,
        color: hex_color('#B08040'),
        specularity: 1,
      }),
      ring: new Material(new Ring_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color('#B08040'),
        specularity: 0,
        smoothness: 0,
      }),
      planet4: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        color: hex_color('#1221C9'),
        specularity: 1,
      }),
      moon: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 0.7,
        color: hex_color('#F22431'),
        specularity: 1,
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 10, 20),
      vec3(0, 0, 0),
      vec3(0, 1, 0)
    );
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      'View solar system',
      ['Control', '0'],
      () => (this.attached = () => this.initial_camera_location)
    );
    this.new_line();
    this.key_triggered_button(
      'Attach to planet 1',
      ['Control', '1'],
      () => (this.attached = () => this.planet_1)
    );
    this.key_triggered_button(
      'Attach to planet 2',
      ['Control', '2'],
      () => (this.attached = () => this.planet_2)
    );
    this.new_line();
    this.key_triggered_button(
      'Attach to planet 3',
      ['Control', '3'],
      () => (this.attached = () => this.planet_3)
    );
    this.key_triggered_button(
      'Attach to planet 4',
      ['Control', '4'],
      () => (this.attached = () => this.planet_4)
    );
    this.new_line();
    this.key_triggered_button(
      'Attach to moon',
      ['Control', 'm'],
      () => (this.attached = () => this.moon)
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

    let sun_radius = 5;
    let pitch_color = color(0, 1, 0, 1);

    // Make a point light source of the same color of the sun located in the center of the sun
    const light_position = vec4(0, 0, 0, 1);
    program_state.lights = [
      new Light(light_position, pitch_color, 10 ** sun_radius),
    ];

    // Draw cylinder
    let pitch_transform = model_transform
      .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
      .times(Mat4.scale(75, 35, 1));
    this.shapes.square.draw(
      context,
      program_state,
      pitch_transform,
      this.materials.sun.override({ color: pitch_color })
    );

    let stand_color = color(0.298, 0.298, 0.298, 1);

    //Near side stands for fans
    let stand1_transform = model_transform
      .times(Mat4.translation(0, 0, 35))
      .times(Mat4.rotation(Math.PI / 4, 1, 0, 0))
      .times(Mat4.scale(65, 10, 1))
      .times(Mat4.translation(0, 1, 0));
    this.shapes.square.draw(
      context,
      program_state,
      stand1_transform,
      this.materials.sun.override({ color: stand_color })
    );

    //Far side stands for fans
    let stand2_transform = model_transform
      .times(Mat4.translation(0, 0, -35))
      .times(Mat4.rotation(-Math.PI / 4, 1, 0, 0))
      .times(Mat4.scale(65, 10, 1))
      .times(Mat4.translation(0, 1, 0));
    this.shapes.square.draw(
      context,
      program_state,
      stand2_transform,
      this.materials.sun.override({ color: stand_color })
    );

    //Right Near Side Lightstand
    let pillar1_transform = model_transform
      .times(Mat4.translation(74, 0, 34))
      .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(1, 25, 1));
    this.shapes.cube.draw(
      context,
      program_state,
      pillar1_transform,
      this.materials.sun.override({ color: stand_color })
    );
    let screen1_transform = pillar1_transform
      .times(Mat4.scale(1, 1 / 25, 1))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(10, 5, 1.5));
    this.shapes.cube.draw(
      context,
      program_state,
      screen1_transform,
      this.materials.sun.override({ color: stand_color })
    );

    //Left Near side Lightstand
    let pillar2_transform = model_transform
      .times(Mat4.translation(-74, 0, 34))
      .times(Mat4.rotation(-Math.PI / 4, 0, 1, 0))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(1, 25, 1));
    this.shapes.cube.draw(
      context,
      program_state,
      pillar2_transform,
      this.materials.sun.override({ color: stand_color })
    );
    let screen2_transform = pillar2_transform
      .times(Mat4.scale(1, 1 / 25, 1))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(10, 5, 1.5));
    this.shapes.cube.draw(
      context,
      program_state,
      screen2_transform,
      this.materials.sun.override({ color: stand_color })
    );

    //Left Far Side Lightstand
    let pillar3_transform = model_transform
      .times(Mat4.translation(-74, 0, -34))
      .times(Mat4.rotation((5 * Math.PI) / 4, 0, 1, 0))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(1, 25, 1));
    this.shapes.cube.draw(
      context,
      program_state,
      pillar3_transform,
      this.materials.sun.override({ color: stand_color })
    );
    let screen3_transform = pillar3_transform
      .times(Mat4.scale(1, 1 / 25, 1))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(10, 5, 1.5));
    this.shapes.cube.draw(
      context,
      program_state,
      screen3_transform,
      this.materials.sun.override({ color: stand_color })
    );

    //Right Far Side Light Stand
    let pillar4_transform = model_transform
      .times(Mat4.translation(74, 0, -34))
      .times(Mat4.rotation((3 * Math.PI) / 4, 0, 1, 0))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(1, 25, 1));
    this.shapes.cube.draw(
      context,
      program_state,
      pillar4_transform,
      this.materials.sun.override({ color: stand_color })
    );
    let screen4_transform = pillar4_transform
      .times(Mat4.scale(1, 1 / 25, 1))
      .times(Mat4.translation(0, 25, 0))
      .times(Mat4.scale(10, 5, 1.5));
    this.shapes.cube.draw(
      context,
      program_state,
      screen4_transform,
      this.materials.sun.override({ color: stand_color })
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
    this.draw_stadium(context, program_state);
    let start_transform = Mat4.identity();
    this.draw_player(context, program_state, start_transform, 'kicking');
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
