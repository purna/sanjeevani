/* =========================================================================
   MOSES — 3D Scene Helpers
   Mirrors adam-scenes-helpers.js but trimmed for Moses scenes.
   Exposes toonMat / addOutline / makeFog / loadJSONScene / helpers.
   ========================================================================= */
(function (global) {
  "use strict";
  var THREE = global.THREE;
  if (!THREE) { console.error('Three.js not loaded'); return; }

  var gradientColors = new Uint8Array([0, 128, 255]);
  var gradientFormat = THREE.RedFormat || THREE.LuminanceFormat;
  var gradientMap = new THREE.DataTexture(gradientColors, 3, 1, gradientFormat);
  gradientMap.needsUpdate = true;
  global.gradientMap = gradientMap;

  global.toonMat = function (colorOrOpts) {
    var opts;
    if (typeof colorOrOpts === 'number') { opts = { color: colorOrOpts }; }
    else { opts = Object.assign({}, colorOrOpts); }
    delete opts.roughness; delete opts.metalness;
    opts.gradientMap = gradientMap;
    return new THREE.MeshToonMaterial(opts);
  };

  var outlineMat = new THREE.MeshBasicMaterial({
    color: 0x000000, side: THREE.BackSide, transparent: true, opacity: 0.85
  });

  global.addOutline = function (mesh, size) {
    var outline = new THREE.Mesh(mesh.geometry, outlineMat);
    outline.scale.setScalar(1 + (size || 0.08));
    outline.renderOrder = 0;
    mesh.add(outline);
    return outline;
  };

  global.makeFog = function (scene, color, density) {
    scene.fog = new THREE.FogExp2(color || 0x000000, density || 0.003);
    return scene.fog;
  };

  global.hexToInt = function (hex) {
    if (typeof hex === 'number') return hex;
    if (!hex) return 0xffffff;
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return parseInt('0x' + h);
  };

  function createGeometryFromJSON(shapeType, obj) {
    switch (shapeType) {
      case 'box': return new THREE.BoxGeometry(2, 2, 2);
      case 'sphere': return new THREE.SphereGeometry(1, 16, 16);
      case 'cylinder': return new THREE.CylinderGeometry(1, 1, 2, 12);
      case 'cone': return new THREE.ConeGeometry(1, 2, 12);
      case 'plane': return new THREE.PlaneGeometry(2, 2);
      case 'torus': return new THREE.TorusGeometry(1, 0.3, 16, 32);
      default: return null;
    }
  }

  function createMeshFromJSON(obj) {
    var st = obj.shapeType;
    var geo = createGeometryFromJSON(st, obj);
    if (!geo) return null;
    var m = obj.material || {};
    var isEmissive = m.type === 'emissive';
    var color = global.hexToInt(obj.color) || global.hexToInt(m.color) || 0xffffff;
    var mat = isEmissive
      ? new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: m.opacity || 0.5 })
      : global.toonMat({ color: color });
    var mesh = new THREE.Mesh(geo, mat);
    global.addOutline(mesh, m.outline !== undefined ? m.outline : 0.08);
    return mesh;
  }

  function createLightFromJSON(obj) {
    var color = global.hexToInt(obj.color) || 0xffffff;
    var intensity = obj.intensity || 1.0;
    if (obj.lightType === 'ambient') return new THREE.AmbientLight(color, intensity);
    if (obj.lightType === 'directional') {
      var d = new THREE.DirectionalLight(color, intensity); d.castShadow = true; return d;
    }
    return new THREE.PointLight(color, intensity, obj.distance || 100);
  }

  global.loadJSONScene = function (data, scene) {
    if (!scene) scene = new THREE.Scene();
    var s = data.settings || {};
    if (s.background) scene.background = new THREE.Color(s.background);
    if (s.fog) global.makeFog(scene, s.fog.color || 0x000000, s.fog.density || 0.003);
    var group = new THREE.Group();
    (data.objects || []).forEach(function (obj) {
      var p = obj.position || {x:0,y:0,z:0};
      var r = obj.rotation || {x:0,y:0,z:0};
      var sc = obj.scale || {x:1,y:1,z:1};
      if (obj.type === 'light') {
        var light = createLightFromJSON(obj);
        if (light) { light.position.set(p.x, p.y, p.z); scene.add(light); }
      } else if (obj.type === 'shape') {
        var mesh = createMeshFromJSON(obj);
        if (mesh) {
          mesh.position.set(p.x, p.y, p.z);
          mesh.rotation.set(r.x, r.y, r.z);
          mesh.scale.set(sc.x, sc.y, sc.z);
          group.add(mesh);
        }
      }
    });
    scene.add(group);
    return group;
  };

  global.SCENE_FACTORIES = global.SCENE_FACTORIES || {};
})(window);