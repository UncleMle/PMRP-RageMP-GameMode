
mp.events.add('breaktyres', (vehicle) => { //Event that break the tires of the vehicle.
    vehicle.setTyreBurst(0, false, 1000);
    vehicle.setTyreBurst(1, false, 1000);
    vehicle.setTyreBurst(4, false, 1000);
    vehicle.setTyreBurst(5, false, 1000);
    vehicle.setBurnout(true);
    setTimeout(_ => {
        vehicle.setBurnout(false);
    }, 2000)
});

