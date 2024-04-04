<br />
<p align="center">
  <h1 align="center">
    CZ3004/SC2079 Multidisciplinary Project - Algorithm Simulator
  </h1>
</p>

# Overview

This repository contains the code for the simulator component of the CZ3004/SC2079 Multidisciplinary Project. It was built in React, Next.js, & TailwindCSS. 

**2023 Semester 1 Update**: At least from what my juniors told me, this repository, along with my other MDP-related ones, are entirely reusuable. The only exception is that you will need to retrain the YOLO model since the fonts/colors were changed. That is a 1-day thing. If you are using these repositories and you don't have a functioning, fully-integrated system by end of Week 4, reconsider your life choices.



## Setup

```bash
npm install
```

Start the app by

```bash
npm run dev
```

The app will be running at `localhost:3000`

## Usage

The interface is as intuitive as it can get. Position the robot where you want it to be and click on the buttons to add obstacles. Then click on `Submit` to find the path, or `Reset All` to clear the map and put the robot back to the starting position. `Reset Robot` just resets the robot to the starting position without clearing the map.

<div style="text-align:center"><img src="/images/1.jpg" alt="Interface" width=350 ></div>

You can drag and drop obstacles. Click on it multiple times to change direction.

<div style="text-align:center"><img src="/images/3.jpg" alt="Interface" width=350 ></div>

Use left panel to view the command list of instructions sent back to the RPI.

Of course, sometimes you might think it's not going by the shortest path possible, but that's because of the various constraints and safeguards in the algorithm, which can all be tweaked in the code.

The algorithm API server should be running at a specific address, which you will need to change in `BaseAPI.js`. To see a working simulator with an online API (online for now at least), visit [here](https://mdp.pyesonekyaw.com/).

# Disclaimer

I am not responsible for any errors, mishaps, or damages that may occur from using this code. Use at your own risk. This code is provided as-is, with no warranty of any kind.

# Acknowledgements

I used [pysonekyaw](https://github.com/pyesonekyaw)'s simulator as a boilerplate and improved it significantly, such as adding no-direction obstacles, being able to change the robot's starting position, and revamped the user interface to make it more modern and intuitive.

# Related Repositories
- [Algorithm](https://github.com/Awonnie/Algorithm-2.0)

