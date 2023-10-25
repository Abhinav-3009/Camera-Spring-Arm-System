import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


//variables
const canvas = document.querySelector('canvas.webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


/**
 * function for adding plane ground to the scene using plane geometry then making it horizontal
 */
function addGround() {

    const groundGeometry = new THREE.PlaneGeometry(50, 50)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: '#04724D' })
    groundMaterial.side = THREE.DoubleSide
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = Math.PI / 2
    return ground
}


/**
 * function to add player model(capsule) to the scene
 */
function addCapsule() {
/**
 * adding capsule on the ground.
 * to create capsule we need one cylinder and two hemispheres
 */

    //adding geometry for all three parts of capsule
    const capsuleGeometry = new THREE.CylinderGeometry(1, 1, 2, 32)
    const topSphereGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2)
    const bottomSphereGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)

    //adding material for all three parts of capsule
    const capsuleMaterial = new THREE.MeshNormalMaterial()
    const topSphereMaterial = new THREE.MeshNormalMaterial()
    const bottomSphereMaterial = new THREE.MeshNormalMaterial()

    //creating mesh for the capsule
    const capsulePart1 = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
    const capsulePart2 = new THREE.Mesh(topSphereGeometry, topSphereMaterial)
    const capsulePart3 = new THREE.Mesh(bottomSphereGeometry, bottomSphereMaterial)
    capsulePart2.position.y = 1
    capsulePart3.position.y = -1

    //creating a group to move around the capsule together
    const capsule = new THREE.Group()
    capsule.add(capsulePart1)
    capsule.add(capsulePart2)
    capsule.add(capsulePart3)
    capsule.position.set(0, 2, 0)
    return capsule
}


// Handle window resize
window.addEventListener('resize', onWindowResize, false)


/**
 * function to update camrera and renderer when resize event listener is triggered
 */
function onWindowResize() {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}


/**
 * function to check if there is any obstacle between camera and capsule
 */
function adjustCameraToAvoidObstacles() {

    //get a vector representing the direction of object's positive z-axis in world space
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    cameraDirection.negate()

    //vector subtraction to get distance between player and camera
    const playerToCamera = new THREE.Vector3()
    playerToCamera.subVectors(camera.position, capsule.position)

    //to get a ray between capsule and camera
    const raycaster = new THREE.Raycaster(capsule.position, cameraDirection, 0, playerToCamera.length())

    // Find the nearest obstacle in the camera's path
    const intersections = raycaster.intersectObjects(obstaclesArray)

    if (intersections.length > 0) {
        // const nearestObstacle = intersections[0].object
        const distanceToObstacle = intersections[0].distance

        // Calculate a new camera position just ahead of the obstacle
        const newCameraPosition = new THREE.Vector3()
        newCameraPosition.copy(cameraDirection)
        newCameraPosition.multiplyScalar(distanceToObstacle + 0.5)

        // Apply easing for smooth transition
        const t = 0.4 // Adjust the value to control the speed of the transition
        camera.position.lerp(capsule.position.clone().add(newCameraPosition), t)
    }
    else {
        // No obstacles in the way, smoothly transition the camera back to the original position
        const t = 0.08 // Adjust the value to control the speed of the transition
        const originalCameraPosition = capsule.position.clone().add(cameraDirection.clone().multiplyScalar(originalDistance))
        camera.position.lerp(originalCameraPosition, t)
    }

}


/**
 * function to add lights in the scene
 */
function createLights() {
    const ambientLight = new THREE.AmbientLight('white', 0.5)
    scene.add(ambientLight)

    const pointLightTop = createPointLight(0, 8, 0, 'green', 0.5)
    const pointLightFront = createPointLight(0, 8, 5, 'blue', 0.5)
    const pointLightBack = createPointLight(0, 8, -5, 'red', 0.5)
    scene.add(pointLightTop, pointLightFront, pointLightBack)
}


/**
 * function to create a point light
 */
function createPointLight(x, y, z, color, intensity) {
    const light = new THREE.PointLight(color, intensity)
    light.position.set(x, y, z)
    return light
}


//scene
const scene = new THREE.Scene()


//add ground to the scene
const ground = addGround()
scene.add(ground)


//add capsule to the scene
const capsule = addCapsule()
scene.add(capsule)


//add lights to the scene
createLights()


//add walls to the scene
const obstaclesArray = [] // all the objects to be identified as obstacle will be stored in this array
const wallHeight = 10
const wallGeometry = new THREE.BoxGeometry(1, wallHeight, 5)
const wallMaterial = new THREE.MeshLambertMaterial({ color: '#BA5624' })


/**
 * function to create walls and then add them in scene and obstacle array
 */
function createWall(x, z, rotationY) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial)
    wall.position.set(x, wallHeight / 2, z)
    wall.rotation.y = rotationY
    obstaclesArray.push(wall)
    scene.add(wall)
}
createWall(4, -2, 0)
createWall(4, -8, 0)
createWall(4, -14, 0)
createWall(4, 4, 0)
createWall(4, 10, 0)
createWall(4, 1, 0)
createWall(1, -17, Math.PI / 2)
createWall(-5, -17, Math.PI / 2)
createWall(-11, -17, Math.PI / 2)
createWall(2, 12.5, Math.PI / 2)
createWall(-4, 12.5, Math.PI / 2)
createWall(-10, 12.5, Math.PI / 2)


// Camera
const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 2, 100)
camera.position.z = 10
camera.position.x = 0
camera.position.y = 4
let originalDistance = camera.position.distanceTo(capsule.position)
scene.add(camera)


// adding orbit controls to camera
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2

// Disable pan and zoom
controls.enablePan = false
controls.enableZoom = false


// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * function that will run in each frame, check for obstacles and update controls to look at the capsule
 */
const animate = () => {

    adjustCameraToAvoidObstacles()

    // Update controls
    controls.update()
    controls.target = capsule.position

    // Render
    renderer.render(scene, camera)

    // Call animate again on the next frame
    window.requestAnimationFrame(animate)
}
animate()