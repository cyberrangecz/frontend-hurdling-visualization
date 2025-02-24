import { CommandLineEntryDTO } from '../DTOs/command-line-entry-dto';
import { CommandLineEntry } from '../models/command-line-entry';

export class CommandLineMapper {
    static fromDTOs(dtos: CommandLineEntryDTO[]): CommandLineEntry[] {
        const result = dtos ? dtos.map((dto) => CommandLineMapper.fromDTO(dto)) : [];
        return result;
    }

    static fromDTO(dto: CommandLineEntryDTO): CommandLineEntry {
        const result = new CommandLineEntry();
        result.timestamp = new Date(dto.timestamp_str).getTime() / 1000;
        result.command = dto.cmd;
        return result;
    }
}
