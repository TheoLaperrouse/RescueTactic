const boom = require("boom");
const fs = require("fs");
const { networkInterfaces } = require("os");
const path = require("path");
const imgModel = require("../schemas/imageSchema");
const server = require("../../server");

exports.addImagePoint = async(req, res) => {
    // {
    //   "idIntervention": "123456789",
    //   "indexPoint": "1",
    //   "name": "36253652"
    // }
    try {
        const body = req.body;
        if (body.idIntervention && body.indexPoint && body.name) {
            let imageInstance = await imgModel.findOne({ idIntervention: body.idIntervention });
            if (imageInstance) {
                imgPath = "uploads/" + body.idIntervention + "/" + body.indexPoint + "/" + body.name + ".png";
                await imgModel.updateOne({ idIntervention: body.idIntervention }, {
                    $push: {
                        points: {
                            name: body.name,
                            indexPoint: body.indexPoint,
                            imagePoint: {
                                data: fs.readFileSync(imgPath),
                                contentType: 'image/png'
                            },
                            // date : Date.now()
                            // longitude : Number,
                            // latitude : Number
                        }
                    }
                });

                const ins = await imgModel.findOne({ idIntervention: body.idIntervention });
                const coor = ins.pointsDuDrone.find(x => x.indexPoint == body.indexPoint);

                server.pusher.trigger(
                    body.idIntervention,
                    "newImagePoint", {
                        "indexPoint": body.indexPoint,
                        "name": body.name,
                        "longitude": coor.longitude,
                        "latitude": coor.latitude,
                        "date": Date.now()
                    }
                );
                return res.status(200).send("L'image à été ajoutée");

            }
            return imageInstance.save(function(err, a) {
                if (err) boom.boomify(err);;
            });
        } else {
            return res
                .status(400)
                .send(`Error: informations manquantes : idIntervention : ${body.idIntervention} ou indexPoint : ${body.indexPoint} ou name : ${body.name}`);
        }
    } catch (err) {
        throw boom.boomify(err);
    }
}


exports.addImageVideo = async(req, res) => {
    // {
    //   "idIntervention": "123456789",
    //   "indexPoint": "1",
    //   "name": "36253652"
    // }
    try {
        const body = req.body;
        if (body.idIntervention) {
            let imageInstance = await imgModel.findOne({ idIntervention: body.idIntervention });
            if (imageInstance) {
                imgPath = "uploads/" + body.idIntervention + "/video.png";
                await imgModel.updateOne({ idIntervention: body.idIntervention }, {
                    imageVideo: {
                        data: fs.readFileSync(imgPath),
                        contentType: 'image/png'
                    }
                });
                server.pusher.trigger(
                    body.idIntervention,
                    "newImageVideo",
                    ""
                );
                return res.status(200).send("L'image à été ajoutée");
            } else {
                return res
                    .status(500)
                    .send(
                        `Error: Information introuvable`
                    );
            }
        } else {
            return res
                .status(400)
                .send(`Error: informations manquantes : idIntervention : ${body.idIntervention}`);
        }
    } catch (err) {
        throw boom.boomify(err);
    }
}

exports.getImageByInterventionAndNameAndPoint = async(req, res) => {
    try {
        const idIntervention = req.params.idIntervention;
        const indexPoint = req.params.indexPoint;
        const name = req.params.name;
        if (idIntervention && indexPoint && name) {
            imgModel.findOne({
                idIntervention: idIntervention,
                points: { $elemMatch: { indexPoint: indexPoint, name: name } }
            }, function(err, doc) {
                if (err) boom.boomify(err);
                if (doc && doc.points) {
                    const dernierPoints = doc.points.reduce((a, b) => {
                        return new Date(a.date) > new Date(b.date) ? a : b;
                    });
                    res.code(200).header('Content-Type', dernierPoints.imagePoint.contentType)
                        .send(dernierPoints.imagePoint.data)
                } else {
                    return res
                        .status(500)
                        .send(
                            `Error: Information introuvable`
                        );
                }
            });
        } else {
            return res
                .status(400)
                .send(`Error: informations manquantes : idIntervention : ${body.idIntervention} ou indexPoint : ${body.indexPoint} ou name : ${body.name}`);
        }
    } catch (err) {
        throw boom.boomify(err);
    }
}

exports.getImagesByPointAndIntervention = async(req, res) => {
    try {
        const idIntervention = req.params.idIntervention;
        const indexPoint = req.params.indexPoint;

        if (idIntervention && indexPoint) {
            const imageInstance = await imgModel.findOne({
                idIntervention: idIntervention,
                points: { $elemMatch: { indexPoint: indexPoint } }
            });
            if (imageInstance) {
                return imageInstance.points.filter(f => f.indexPoint == indexPoint).map(({ name, date }) => ({ name, date })) // , function (err, doc) {
            } else {
                return res
                    .status(500)
                    .send(
                        `Error: Information introuvable`
                    );
            }
        } else {
            return res
                .status(400)
                .send(`Error: informations manquantes : idIntervention : ${body.idIntervention} ou indexPoint : ${body.indexPoint} ou name : ${body.name}`);
        }
    } catch (err) {
        throw boom.boomify(err);
    }


}


exports.getImageVideoByIntervention = async(req, res) => {
    try {
        const idIntervention = req.params.idIntervention;
        if (idIntervention) {
            const im = await imgModel.findOne({
                idIntervention: idIntervention
            });
            if (im) {
                return res.code(200).header('Content-Type', im.imageVideo.contentType).send(im.imageVideo.data)
            } else {
                return res
                    .status(500)
                    .send(`Error: No Image`);
            }
        } else {
            return res
                .status(400)
                .send(`Error: informations manquantes : idIntervention : ${body.idIntervention}`);
        }
    } catch (err) {
        throw boom.boomify(err);
    }
}


exports.getPointByIntervention = async(req, res) => {
    try {
        const idIntervention = req.params.idIntervention;

        if (idIntervention) {
            const imageInstance = await imgModel.findOne({
                idIntervention: idIntervention
            });
            if (imageInstance) {
                let multiple = imageInstance.points;
                let a = imageInstance.pointsDuDrone
                multiple.forEach(image => {
                    if (a.filter(e => e.indexPoint === image.indexPoint).length > 0) {
                        const tmp = a.find(a => a.indexPoint == image.indexPoint)
                        image.longitude = tmp.longitude;
                        image.latitude = tmp.latitude;
                    }
                })


                function getUniqueListBy(arr, key) {
                    return [...new Map(arr.map(item => [item[key], item])).values()]
                }

                let b = getUniqueListBy(multiple, 'indexPoint');


                b = b.map(({ indexPoint, latitude, longitude }) => ({ indexPoint, latitude, longitude }));

                // b = b.map(({imagePoint, name,date, ...remainingAttrs}) => remainingAttrs);

                console.log(b)


                b.forEach(e => {
                    e.nbImage = multiple.filter(elem => e.indexPoint == elem.indexPoint).length
                })


                return res.status(200).send(b);

            } else {
                return res
                    .status(500)
                    .send(
                        `Error: Information introuvable`
                    );
            }
        } else {
            return res
                .status(400)
                .send(`Error: informations manquantes : idIntervention : ${body.idIntervention}`);
        }
    } catch (err) {
        throw boom.boomify(err);
    }
}

exports.deleteAllImages = async(req, res) => {
    try {
        return imgModel.deleteMany();
    } catch (err) {
        throw boom.boomify(err);
    }
};