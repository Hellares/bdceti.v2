import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private readonly confiService: ConfigService

  ) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
  }))
  async uploadProdctImage( 
    @UploadedFile() file: Express.Multer.File ){
      if(!file){
        throw new BadRequestException('Asegúrese de que el archivo sea una imagen');
      }
      //return this.filesService.uploadImage(file);
      //console.log(file);
      const {version, public_id, format} =  await this.filesService.uploadImage(file);
      console.log(await this.filesService.uploadImage(file));
      //const {secure_url } = secure_urls;
      //return {secure_url};
      const url = `${this.confiService.get('HOST_NAME')}v${version}/${public_id}.${format}`
      return {url};
  }

  

}
