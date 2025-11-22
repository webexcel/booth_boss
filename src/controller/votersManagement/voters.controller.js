import createKnexInstance from "../../../configs/db.js";
import { logger } from "../../../configs/winston.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import xlsx from "xlsx";

export const getVoters = async (req, res, next) => {
    let knex = null;
    try {
        const { dbname, user_name } = req.user;

        logger.info("Voters list Request Received", {
            username: user_name,
            reqdetails: "voters-getVoters",
        });

        knex = await createKnexInstance(dbname);

        const result = await knex('voters')
            .leftJoin("constituencies", "voters.booth_id", "voters.constituency_id")
            .leftJoin("blocks", "voters.block_id", "blocks.id")
            .leftJoin("booths", "voters.booth_id", "booths.id")
            .leftJoin("parts", "voters.part_id", "parts.id")
            .select(
                "voters.id",
                "voters.constituency_id",
                "voters.block_id",
                "voters.booth_id",
                "voters.part_id",
                "voters.voter_id",
                "voters.name",
                "voters.father_husband_name",
                "voters.photo",
                "voters.age",
                "voters.gender",
                "voters.house_no",
                "voters.address",
                "voters.phone",
                "voters.email",
                "voters.polling_station",
                "voters.notes",
                "constituencies.code as constituencies_code",
                "constituencies.name as constituencies_name",
                "blocks.code as block_code",
                "blocks.name as block_name",
                "booths.code as booth_code",
                "booths.name as booth_name",
                "parts.code as part_code",
                "parts.name as part_name"
            )
            .where({ 'voters.is_active': '1' });

        if (result && result.length > 0) {
            logger.info("Voters list retrieved successfully", {
                username: user_name,
                reqdetails: "voters-getVoters",
            });
            return res.status(200).json({
                message: "Voters list retrieved successfully",
                data: result,
                status: true,
            });
        } else {
            logger.warn("No Voters list found", {
                username: user_name,
                reqdetails: "voters-getVoters",
            });
            return res.status(400).json({
                message: "No Voters list found",
                status: false,
                data: [],
            });
        }
    } catch (err) {
        logger.error("Error fetching Voters list", {
            error: err.message,
            stack: err.stack,
            username: req.user?.user_name,
            reqdetails: "voters-getVoters",
        });
        next(err);
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
};

export const addVoter = async (req, res, next) => {
    let knex = null;
    try {
        const { constituency_id, block_id, booth_id, part_id, voter_id, name, father_husband_name, age, gender,
            house_no, address, phone, email, polling_station, notes } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Add Voter Request Received", {
            username: user_name,
            reqdetails: "voters-addVoter",
        });

        if (!constituency_id || !block_id || !booth_id || !part_id || !voter_id || !name) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "voters-addVoter",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('voters')
            .where({ voter_id })
            .first();

        if (exists) {
            logger.warn("Duplicate Entry detected", {
                username: user_name,
                reqdetails: "voters-addVoter",
            });
            return res.status(400).json({
                message: "Duplicate Entry detected",
                status: false,
            });
        }

        const insertResult = await knex('voters')
            .insert({
                constituency_id,
                block_id,
                booth_id,
                part_id,
                voter_id,
                name,
                father_husband_name,
                age,
                gender,
                house_no,
                address,
                phone,
                email,
                polling_station,
                notes
            });

        if (insertResult) {
            logger.info("Voter inserted successfully", {
                username: user_name,
                reqdetails: "voters-addVoter",
            });
            return res.status(200).json({
                message: "Voter inserted successfully",
                status: true,
            });
        } else {
            logger.error("Failed to insert Voter", {
                username: user_name,
                reqdetails: "voters-addVoter",
            });
            return res.status(500).json({
                message: "Failed to insert Voter",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error inserting Voter:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const editVoter = async (req, res, next) => {
    let knex = null;
    try {
        const { id, key, value } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Edit Voter Request Received", {
            username: user_name,
            reqdetails: "voters-editVoter",
        });

        if (!id || !key || !value) {
            logger.error("Mandatory fields are missing for Edit Voter", {
                username: user_name,
                reqdetails: "voters-editVoter",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const exists = await knex('voters')
            .where({ id: id, is_active: "1" })
            .first();

        if (!exists) {
            logger.warn("No Data Found!", {
                username: user_name,
                reqdetails: "voters-editVoter",
            });
            return res.status(400).json({
                message: "No Data Found!",
                status: false,
            });
        }

        // const updateResult = await knex("voters")
        //     .update({
        //         constituency_id,
        //         block_id,
        //         booth_id,
        //         part_id,
        //         voter_id,
        //         name,
        //         father_husband_name,
        //         age,
        //         gender,
        //         house_no,
        //         address,
        //         phone,
        //         email,
        //         polling_station,
        //         notes
        //     })
        //     .where({ id });

        let updateResult;

        if (key == "photo" && value.startsWith('data:image/')) {
            const s3 = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });

            const base64Data = value.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');

            const matches = value.match(/^data:(image\/\w+);base64,/);
            const mimeType = matches ? matches[1] : null;

            let extension = 'png';
            if (mimeType) {
                extension = mimeType.split('/')[1];
            }

            const fileName = `voter_${id}.${extension}`;
            const s3Key = `election/voter/${fileName}`;

            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
                Body: buffer,
                ContentEncoding: 'base64',
                ContentType: `image/${extension}`,
                // ACL: 'public-read'
            };

            await s3.send(new PutObjectCommand(uploadParams));

            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

            updateResult = await knex("voters").update({ [key]: fileUrl }).where({ id: id });
        } else {
            updateResult = await knex("voters").update({ [key]: value }).where({ id: id });
        }

        if (updateResult) {
            logger.info("Voter updated successfully", {
                username: user_name,
                reqdetails: "voters-editVoter",
            });
            return res.status(200).json({
                message: "Voter updated successfully",
                status: true,
            });
        } else {
            logger.error("Voter not found or update failed", {
                username: user_name,
                reqdetails: "voters-editVoter",
            });
            return res.status(400).json({
                message: "Voter not found or update failed",
                status: false,
            });
        }
    } catch (error) {
        console.error("Error updating Voter:", error);
        next(error);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const deleteVoter = async (req, res, next) => {
    let knex = null;
    try {
        const { id } = req.body;
        const { dbname, user_name } = req.user;

        logger.info("Delete Voter Request Received", {
            username: user_name,
            reqdetails: "roles-deleteRoles",
        });

        if (!id) {
            logger.error("Mandatory fields are missing", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(400).json({
                message: "Mandatory fields are missing",
                status: false,
            });
        }

        knex = await createKnexInstance(dbname);

        const record = await knex("voters")
            .select("*")
            .where({ id })
            .first();

        if (!record) {
            logger.error("Record not found", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(400).json({
                message: "Record not found",
                status: false,
            });
        }

        const deleteRes = await knex("voters")
            .update({ is_active: "0" })
            .where({ id: id });

        if (deleteRes) {
            logger.info("Voter deleted successfully", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(200).json({
                message: "Voter deleted successfully",
                status: true,
            });
        } else {
            logger.error("Voter not found or delete failed", {
                username: user_name,
                reqdetails: "roles-deleteRoles",
            });
            return res.status(400).json({
                message: "Voter not found or delete failed",
                status: false,
            });
        }
    } catch (err) {
        console.error("Error deleting Voter:", err);
        next(err);
    } finally {
        if (knex) {
            knex.destroy();
        }
    }
};

export const voterBulkUpload = async (req, res, next) => {
    let knex = null;

    if (!req.file) {
        logger.error("No file uploaded for bulk upload", {
            reqdetails: "voter-bulk-upload",
        });
        return res.status(400).send("No file uploaded.");
    }

    try {
        const { dbname, user_name } = req.user;

        logger.info("Voter bulk upload request received", {
            username: user_name,
            reqdetails: "voter-bulk-upload",
        });

        knex = await createKnexInstance(dbname);

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const requestedVoterIds = sheetData.map((i) => i.voter_id);

        logger.info("Checking existing voter IDs", {
            username: user_name,
            reqdetails: "voter-bulk-upload",
            count: requestedVoterIds.length,
        });

        const existingVoters = await knex("voters")
            .select("voter_id")
            .whereIn("voter_id", requestedVoterIds);

        const existingIds = existingVoters.map((v) => v.voter_id);

        // Only new voter IDs
        const newVoterIds = requestedVoterIds.filter(
            (id) => !existingIds.includes(id)
        );

        // Final Data to Insert
        const insertData = sheetData.filter((i) =>
            newVoterIds.includes(i.voter_id)
        );

        logger.info("Preparing voter data for insert", {
            username: user_name,
            newCount: insertData.length,
            reqdetails: "voter-bulk-upload",
        });

        if (insertData.length < 1) {
            return res.status(200).json({
                message: "No new voters to insert",
                status: true,
            });
        }

        const finalInsertData = insertData.map((i) => ({
            constituency_id: i.constituency_id,
            block_id: i.block_id,
            booth_id: i.booth_id,
            part_id: i.part_id,
            voter_id: String(i.voter_id),
            name: i.name,
            father_husband_name: i.father_husband_name || null,
            photo: i.photo || null,
            age: i.age || null,
            gender: i.gender?.toLowerCase() || "male",
            house_no: i.house_no || null,
            address: i.address || null,
            phone: i.phone || null,
            email: i.email || null,
            polling_station: i.polling_station || null,
            notes: i.notes || null,
        }));

        const insertResult = await knex("voters").insert(finalInsertData);

        logger.info("Voters created successfully", {
            username: user_name,
            count: finalInsertData.length,
            reqdetails: "voter-bulk-upload",
        });

        return res.status(200).json({
            message: "Voters created successfully",
            status: true,
            inserted: finalInsertData.length,
        });

    } catch (error) {
        logger.error("Error in voter bulk upload", {
            error: error.message,
            reqdetails: "voter-bulk-upload",
        });
        next(error);
    } finally {
        if (knex) knex.destroy();
    }
};
