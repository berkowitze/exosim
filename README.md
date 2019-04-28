# Exosim

## Phys 0112 Midterm Project
#### Elias Berkowitz, Isaiah Brand

The site is live at [https://exosim.netlify.com/](https://exosim.netlify.com/)

### Project Description

Exosim is a web app that allows users to experiment with exoplanet observation. They are able to create their own solar systems, and observe realistic data that modern telescopes might collect from such a system.

One of the most fascinating aspects of astronomy is how extreme conclusions are drawn from very limited data. This is especially true in the case of exoplanets, where we are trying to estimate information about an object which often occupies less than a single pixel in an image, and whose brightness is orders of magnitude dwarfed by the nearby star. We hope that Exosim can begin to convey how truly limited our ability is to observe these foreign planets, and how impressive it is that we've been able to draw conclusions about their existence and properties.

## Functionality Overview

 * Real pre-built solar systems
 * Real-time, real-scale simulation
 * Interface for user specified bodies
 * 3D rendering allows for different viewing angles
 * Changing time-scale
 * Dragging around and removing objects

**Note**: It seems the Kepler system is unstable over long time periods, likely due to inprecise measurements of planetary properties. 

### Intended Audience

This project is intended to be used by students and enthusiasts. We specifically chose to use Javascript for this project and build a standalone webpage so that anybody can easily access and use this simulation. Our hope is that compelling visuals and an intuitive interface will make our project fun to use. Once the user is comfortable exploring the intuitive system-builder interface, they will be able to explore the more science-focused features that we are implementing for the final. 

### Technical Details

The entire project is built in Javascript. We use simple Euler integration to model the dynamics in 3D. In the future we plan to upgrade to Runge-Kutta. The 3D positions of the planets are projected into 2D based on the position of the camera.

An explanation of the mathematics of the system can be found in `/math.pdf`.

### Code layout
All relevant code can be found in the `/scripts` folder. The overall program logic is within `sketch.js`. The simulation logic can be found in `model.js`. Constants can be found in `parameters.js` and `solarsystems.js`. Most other files are for rendering or setup work.

### Upcoming features

 * Transit curves
 * Radial velocity curves
 * Transit timing variation
 * Loading real systems from the [exoplanet.eu](exoplanet.eu) database


### References

Peter W. Sullivan et al, 2015, _The Transiting Exoplanet Survey Satellite: Simulations of Planet Detections and Astrophysical False Positives_, The American Astronomical Society, Vol 801, Number 1
 
F. Varadi et al., 2003, _Successive Refinements in Long-Term Integrations of Planetary Orbits_, The American Astronomical Society, Volume 592, Number 1

Ksanfomaliti, 1999, _The Search for Extrasolar Planets by Means of the Radial-Velocity Spectral Method and Astrometry_, Solar System Research Volume 33, Page 482

C.J. Voesenek, 2008, _Implementing a Fourth Order Runge-Kutta Method for Orbit Simulation_, Rochester Institute of Technology





### Upcoming features

 * Transit curves
 * Radial velocity curves
 * Transit timing variation
 * Loading real systems from the [exoplanet.eu](exoplanet.eu) database

