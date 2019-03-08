function circleOverlap(r1, r2, d) {
	let a = max(r1,r2);
	let b = min(r1,r2);
	if (d >= a+b) { // circles don't overlap
		return 0;
	}  else if (d <= a-b) { // circles fully overlap
		return PI * sq(b);
	} else { // circles partially overlap
		let theta_a = Math.acos((sq(d) + sq(a) - sq(b))/(2*d*a));
		let theta_b = Math.acos((sq(d) + sq(b) - sq(a))/(2*d*b));

		let d_a = Math.cos(theta_a)*a;
		let d_b = d - d_a;
		let h = Math.sin(theta_a)*a;

		let arcArea_a = sq(a)*theta_a;
		let arcArea_b = sq(b)*theta_b;

		let triArea_a = h * d_a;
		let triArea_b = h * d_b;

		let sliver_a = arcArea_a - triArea_a;
		let sliver_b = arcArea_b - triArea_b;

		return sliver_a + sliver_b;
	}
}
