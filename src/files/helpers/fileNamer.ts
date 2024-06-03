

export const fileNamer = ( req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if( !file ) return callback( new Error('Fiel is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `ceti.${fileExtension}`;

    
    callback(null, fileName);
}