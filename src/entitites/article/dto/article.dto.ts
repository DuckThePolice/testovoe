export class ArticleDto {
    id!: number
    author!: number
    title!: string
    preview!: File
    text!: string
    attachments!: Array<string>
}