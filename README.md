# Exosim

## Phys 0112 Midterm Project
#### Elias Berkowitz, Isaiah Brand

The site is live at [https://exosim.netlify.com/](https://exosim.netlify.com/)

### Project Description

Exosim is a web app that allows users to experiment with exoplanet observation. They are able to create their own solar systems, and observe realistic data that modern telescopes might collect from such a system.

One of the most fascinating aspects of astronomy is how extreme conclusions are drawn from very limited data. This is especially true in the case of exoplanets, where we are trying to estimate information about an object which often occupies less than a single pixel in an image, and whose brightness is orders of magnitude dwarfed by the nearby star. We hope that Exosim can begin to convey how truly limited our ability is to observe these foreign planets, and how impressive it is that we've been able to draw conclusions about their existence and properties.

## Functionality Overview

 * Real pre-built solar systems.
 * Real-time, real-scale simulation.
 * Creating user-specified bodies.
 * 3D rendering.
 * Live measurements of star brightness.


### User Interface
 * Drag a body to move it around.
 * Right click a body to focus the camera on it.
 * Change the ecliptic angle to view the solar system at different angles. At ~90 degrees, you can observe transits!
 * Use the sidebar to tweak the model parameters, including visual drawing scale and time scale.
 * Listen to relaxing music as you go (M to mute if you need).
 * Dynamic interface to create new bodies (stars, planets, moons).
 * Dragging around and removing objects.
 * Live graph of every star's brightness.

### Intended Audience

This project is intended to be used by students and enthusiasts. We specifically chose to use Javascript for this project and build a standalone webpage so that anybody can easily access and use this simulation. Our hope is that compelling visuals and an intuitive interface will make our project fun to use. Once the user is comfortable exploring the intuitive system-builder interface, they will be able to explore the more science-focused features that we are implementing for the final. 

### Technical Details

The entire project is built in Javascript. We use simple backward Euler integration to model the dynamics in 3D. The 3D positions of the planets are projected into 2D based on the position of the camera.

The mathematics for the dynamics are a set of two nonlinear ODEs:

$$
\begin{cases}
\dot{\vec{x_i}} = \vec{v} \\
\dot{\vec{v_i}} = \frac{1}{M_i}\sum\limits_{j \neq i} \vec{F}_{ij}
\end{cases}
$$

Here, $v_i$ is the velocity of the planet and $x_i$ is its position (both in three dimensions).

The force between two planets is:
$$\vec{F_{ij}} = G\frac{M_iM_j}{r_{ij}^3} (\vec{x_i} - \vec{x_j})$$
with $M$ the mass of the planet, and $r_{ij} = |\vec{x_i} - \vec{x_j}|$.

### Code layout
All relevant code can be found in the `/scripts` folder. The overall program logic is within `sketch.js`. The simulation logic can be found in `model.js`. Constants can be found in `parameters.js` and `solarsystems.js`. Most other files are for rendering, user interface, or setup work.


### References

Peter W. Sullivan et al, 2015, _The Transiting Exoplanet Survey Satellite: Simulations of Planet Detections and Astrophysical False Positives_, The American Astronomical Society, Vol 801, Number 1
 
F. Varadi et al., 2003, _Successive Refinements in Long-Term Integrations of Planetary Orbits_, The American Astronomical Society, Volume 592, Number 1

Ksanfomaliti, 1999, _The Search for Extrasolar Planets by Means of the Radial-Velocity Spectral Method and Astrometry_, Solar System Research Volume 33, Page 482

C.J. Voesenek, 2008, _Implementing a Fourth Order Runge-Kutta Method for Orbit Simulation_, Rochester Institute of Technology





### Upcoming features (before presentation Wednesday)

 * Transit timing variation
 * Loading real systems from the [exoplanet.eu](exoplanet.eu) database


