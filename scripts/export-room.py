import bpy, numpy as np
from pathlib import Path
from mathutils import Vector
ROOT=Path('/home/mads/Projects/surround-speaker-mount')
OUT=Path(__file__).resolve().parents[1]/'public/media/room'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'rail-mount/render/dorm_room.blend'))
# Export full model; label shell surfaces so the viewer can open the room.
for o in list(bpy.data.objects):
    if o.type not in {'MESH','EMPTY'}:
        bpy.data.objects.remove(o,do_unlink=True);continue
    o.hide_set(False);o.hide_viewport=False;o.hide_render=False
    if o.type=='MESH':
        coords=[o.matrix_world @ Vector(v) for v in o.bound_box]
        lo=[min(v[i] for v in coords) for i in range(3)]
        hi=[max(v[i] for v in coords) for i in range(3)]
        shell=o.name.startswith('Architecture') or 'Ceiling' in o.name
        o['shell']=shell
        o['roof']='Ceiling' in o.name or (shell and lo[2]>2.59)
        o['rear']=shell and lo[1]>4.39
        o['side']=('left' if hi[0]<.01 else 'right' if lo[0]>2.54 else '') if shell else ''
        # Lightweight, local-space UV mapping for grain on wood surfaces.
        if any(m and ('oak' in m.name or 'beech' in m.name) for m in o.data.materials):
            uv=o.data.uv_layers.new(name='Wood UV')
            vs=np.array([v.co[:] for v in o.data.vertices]); span=np.maximum(vs.max(0)-vs.min(0),1e-6); norm=(vs-vs.min(0))/span
            for p in o.data.polygons:
                axis=max(range(3),key=lambda i:abs(p.normal[i])); a,b=[i for i in range(3) if i!=axis]
                for li in p.loop_indices:
                    co=norm[o.data.loops[li].vertex_index];uv.data[li].uv=(float(co[a]),float(co[b]))
# Portable materials: retain source colours and replace procedural wood by textures.
rng=np.random.default_rng(24)
for m in bpy.data.materials:
    if not m.use_nodes:continue
    p=m.node_tree.nodes.get('Principled BSDF')
    if not p:continue
    for socket in ['Base Color','Normal']:
        for l in list(p.inputs[socket].links):m.node_tree.links.remove(l)
    if 'oak' in m.name or 'beech' in m.name:
        size=512;y,x=np.mgrid[0:size,0:size]/size
        grain=np.sin(x*260+np.sin(y*9)*2+np.sin(x*38+y*4))*0.045+rng.normal(0,.012,(size,size))
        base=np.array([.58,.40,.23] if 'oak' in m.name else [.48,.30,.16])
        pixels=np.ones((size,size,4),np.float32);pixels[:,:,:3]=np.clip(base+grain[:,:,None],0,1)
        im=bpy.data.images.new(m.name+' grain',width=size,height=size);im.pixels.foreach_set(pixels.ravel());im.pack()
        tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
bpy.ops.export_scene.gltf(filepath=str(OUT/'room.glb'),export_format='GLB',export_apply=True,export_extras=True,export_cameras=False,export_lights=False,export_animations=False,export_yup=True)
print('EXPORTED', (OUT/'room.glb').stat().st_size)
