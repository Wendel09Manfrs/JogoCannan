const qtdAcima = document.getElementById('cubosEmb')
const qtdAbaixo = document.getElementById('cubosEmc')

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Configuração do Cannon.js
const mundo = new CANNON.World()
mundo.gravity.set(0, -3, 0)

const boxShape = new CANNON.Box(new CANNON.Vec3(4, 4, 0.05)) 
const boxBody = new CANNON.Body({ mass: 0 })
boxBody.addShape(boxShape)
boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), -Math.PI / 2) 
boxBody.position.y = 0 
mundo.addBody(boxBody)

const geometriaCaixa = new THREE.BoxGeometry(8, 8, 0.1);
const caixaMaterial = new THREE.MeshBasicMaterial({ color: 0xfff0ff });
const caixaMesh = new THREE.Mesh(geometriaCaixa, caixaMaterial);

caixaMesh.userData.physicsBody = boxBody;
caixaMesh.position.copy(boxBody.position);
caixaMesh.quaternion.copy(boxBody.quaternion);

scene.add(caixaMesh);

const planoGeometria = new THREE.PlaneGeometry(4, 4)
const planoMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee })
const plano = new THREE.Mesh(planoGeometria, planoMaterial)
plano.rotation.x = -Math.PI / 2 // Ajusta a rotação para que o plano fique horizontal
plano.position.y = 0

plano.userData.physicsBody = boxBody

scene.add(plano)
function corAleatoria() {
  const r = Math.random()
  const g = Math.random()
  const b = Math.random()
  return new THREE.Color(r, g, b)
}
function criacubo(y, z) {
  // Geometria e material do cubo
  const geometriaCubo = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const materialCubo = new THREE.MeshBasicMaterial({ color: corAleatoria()})
  const cubo = new THREE.Mesh(geometriaCubo, materialCubo)
  const cuboShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
  const cuboBody = new CANNON.Body({ mass: 1 })
  cuboBody.addShape(cuboShape)
  const posicao = new CANNON.Vec3(0, y, z)
  cuboBody.position.copy(posicao)
  cubo.position.copy(posicao)
  scene.add(cubo)
  mundo.addBody(cuboBody)
  return { cubo, cuboBody }
}
let cubos = [] // Array para manter controle dos cubos
let x = 6
let y = 1.5
let ycam = 0.5
let z = 0
camera.position.set(x, y, z)
camera.lookAt(0, y, 0)
let estaCaindo = false

y += 0.8
ycam += 0.5
x += 0.7
const newcubo = criacubo(y, 0.1)
cubos.push(newcubo)

camera.position.set(x, ycam, 0)
camera.lookAt(0, ycam, 0)

let caindo = false

document.addEventListener('mousedown', () => {
  caindo = true
})

let cubosAcima = 0;
let cubosAbaixo = 0;

let loss = document.getElementById('loss')
let win = document.getElementById('win')

let cubosContados = new Set();
// Função de animação para atualizar a física e renderizar a cena
function animate() {
  requestAnimationFrame(animate)
  cubosAcima = 0;
  cubosAbaixo = 0;

  cubos.forEach(({ cubo, cuboBody }) => {
    cubo.position.copy(cuboBody.position)
    cubo.quaternion.copy(cuboBody.quaternion)
    const posY = cuboBody.position.y;
    if (posY > 0) {
       cubosAcima++;   
        qtdAcima.innerHTML=  cubosAcima;
    } else {
        cubosAbaixo++;
        qtdAbaixo.innerHTML= cubosAbaixo;
    }
    cubosContados.add(cubo);
  
  })
  let ac = parseInt(qtdAcima.innerHTML)
  let ab = parseInt(qtdAbaixo.innerHTML)
  mundo.step(1 / 60)
  const ultimoCubo = cubos[cubos.length - 1] // Obtém o último cubo
  if (ultimoCubo) {
    const tempo = Date.now() * 0.0005// Tempo em segundos
    const amplitude = 8 // Amplitude do movimento no eixo x
    const frequencia = 0.5 // Frequência do movimento
    const posicaoZ = amplitude * Math.sin(2 * Math.PI * frequencia * tempo)
    const movimento = new CANNON.Vec3(1, y, posicaoZ)
    ultimoCubo.cuboBody.position.copy(movimento)
    ultimoCubo.cubo.position.copy(movimento)
    if (caindo === true) {
      y += 0.5
      ycam += 0.5
      x += 0.7
      const newcubo = criacubo(y, posicaoZ)
      cubos.push(newcubo)
      
      camera.position.set(x, ycam, 0)
      camera.lookAt(0, ycam, 0)
      caindo = false
    } }
  if (ab > 11&& ac<51 ) {
  loss.style.display = 'flex'}
  else if(ab<11&&ac>51){
  win.style.display = 'flex'}
  renderer.render(scene, camera)
}
animate()

