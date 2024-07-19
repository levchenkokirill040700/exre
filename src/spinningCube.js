(function(global) {
  class spinningCube extends NIN.THREENode {
    constructor(id, options) {
      super(id, {
        camera: options.camera,
        outputs: {
          render: new NIN.TextureOutput()
        }
      });

      this.cube = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 5),
                                 new THREE.MeshBasicMaterial({ color: 0x000fff }));
      this.scene.add(this.cube);

      var light = new THREE.PointLight(0xffffff, 1, 100);
      light.position.set(50, 50, 50);
      this.scene.add(light);

      this.camera.position.z = 100;

      this.center_tunnel_radi = 3;
      this.tunnel_radi = 1;
      this.sections = 40;
      this.subsections = 40;

      this.torus_geometry = this.generateTorusGeom(this.center_tunnel_radi, this.tunnel_radi, this.sections, this.subsections);
      let skyboxmap = Loader.loadTexture('res/gradient.jpg');
      var torus_material = new THREE.MeshPhysicalMaterial({color: 0xffffff, map: skyboxmap, shading: THREE.SmoothShading});
      this.torus = new THREE.Mesh(this.torus_geometry, torus_material);

      this.scene.add(this.torus);
    }


    generateTorusGeom(center_tunnel_radi, tunnel_radi, sections, subsections) {
      var geometry = new THREE.Geometry();

      var vertices = [];
      this.uv_map_vertices = [];

      for (var i = 0; i < sections; i++) {
        // Find the position of the center of the torus (a cirle).
        var subsection_center_vect = new THREE.Vector3(Math.sin(i * Math.PI * 2 / sections), 0, Math.cos(i * Math.PI * 2 / sections));
        for (var j = 0; j < subsections; j++) {
          // Find the vector from the center of the torus to the outer perimiter.
          var subsection_surface_vect = new THREE.Vector3(subsection_center_vect.x * Math.sin(j * Math.PI * 2 / subsections), 
                                                          Math.cos(j * Math.PI * 2 / subsections),
                                                          subsection_center_vect.z * Math.sin(j * Math.PI * 2 / subsections)
                                                         );
          subsection_surface_vect.multiplyScalar(tunnel_radi);

          // Add the new point.
          vertices.push(
              new THREE.Vector3(
                subsection_center_vect.x * center_tunnel_radi +
                  subsection_surface_vect.x,
                subsection_center_vect.y + subsection_surface_vect.y,
                subsection_center_vect.z * center_tunnel_radi +
                subsection_surface_vect.z));
          geometry.vertices.push(vertices[vertices.length - 1]);

          this.uv_map_vertices.push(new THREE.Vector2(i / sections, j / subsections));
        }
      }

      for (i = 0; i < sections; i++) {
        for (j = 0; j < subsections; j++) { 
          // Add faces to the geometry
          var x1 = i * sections + j;
          var y1 = i * sections + ((j + 1) % (subsections));
          var z1 = ((i + 1) % sections) * sections + j;
          var x2 = i * sections + ((j + 1) % (subsections));
          var y2 = ((i + 1) % sections) * sections + ((j + 1) % (subsections));
          var z2 = ((i + 1) % sections) * sections + j;

          geometry.faces.push( new THREE.Face3(x1, y1, z1));
          geometry.faces.push( new THREE.Face3(x2, y2, z2));

          geometry.faceVertexUvs[0][(i * subsections + j) * 2] = [this.uv_map_vertices[x1], this.uv_map_vertices[y1], this.uv_map_vertices[z1]];
          geometry.faceVertexUvs[0][(i * subsections + j) * 2 + 1] = [this.uv_map_vertices[x2], this.uv_map_vertices[y2], this.uv_map_vertices[z2]];
        }
      }

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      return geometry;
    }

    update(frame) {
      super.update(frame);

      this.cube.rotation.x = Math.sin(frame / 10);
      this.cube.rotation.y = Math.cos(frame / 10);
    }
  }

  global.spinningCube = spinningCube;
})(this);
