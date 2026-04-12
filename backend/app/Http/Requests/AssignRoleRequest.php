<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', Rule::exists('roles', 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'roles.required' => 'Roles are required.',
            'roles.array' => 'Roles must be an array.',
            'roles.min' => 'At least one role must be selected.',
            'roles.*.integer' => 'Each role must be an integer.',
            'roles.*.exists' => 'Selected role does not exist.',
        ];
    }
}
